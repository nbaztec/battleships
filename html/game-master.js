const params = (new URL(document.location)).searchParams;

const GameStateInitial = 0;
const GameStatePlanning = 1;
const GameStatePlaying = 2;
const GameStateFinished = 3;

function showError(err) {
    console.log(err)
    if (!err) {
        return;
    }

    if (err.response) {
        alert(err.response.data.message);
    } else {
        alert(err);
    }
}

function setQuery(obj) {
    let newSearch = window.location.search;
    Object.keys(obj).forEach(k => {
        const v = obj[k];
        const regex = new RegExp("([?;&])" + k + "[^&;]*[;&]?");
        const query = newSearch.replace(regex, "$1").replace(/&$/, '');

        newSearch = (query.length > 2 ? query + "&" : "?") + (v ? k + "=" + v : '');
    });

    window.location = window.location.pathname + newSearch;
}

class GameMaster {
    constructor() {
        this._gid = params.get('gid');
        this._pid = params.get('pid');
        this._size = params.get('size') || 10;
        this._api = new API();

        this._state = {};
        this._finished = false;
        this._won = null;
        this._revision = null;
        this._lastOpponentTurn = {
            id: null,
            action: null,
        };
    }

    get _player() {
        return this._state.player1.id !== '-' ? this._state.player1 : this._state.player2;
    }

    get _opponent() {
        return this._state.player1.id === '-' ? this._state.player1 : this._state.player2;
    }

    _initGrids() {
        this.gridPlan = new GridPlayer('grid-player', {}, this._state.gridSize);
        this.gridPlay = new GridOpponent('grid-opponent', {}, this._state.gridSize);
    }

    _startPlanUI() {
        $waitingOpponent.hide();
        $gameLinkArea.hide();
        $actionsPlan.show();
        $gridPlayer.show();
        $btnReset.enable();

        audioStart.stopAndPlay();

        this.gridPlan.set(this._player.ships, {});
        this.gridPlan.drawPlanField();
        this.gridPlay.set(this._opponent.ships, {});
        this.gridPlay.drawPlayField();

        const needPlacement = Object.values(this._player.ships).some((ship) => {
            const {row, col} = ship.position;
            return row === -1 && col === -1;
        });

        if (needPlacement) {
            this.placeShips();
        }
    }

    _startPlayUI() {
        $waitingOpponent.hide();
        $gameLinkArea.hide();
        $gridPlayer.show();
        $gridOpponent.show();
        $actionsPlan.hide();
        $actionsPlay.show();

        audioStart.stopAndPlay();

        this.updateState();
        this.waitTurn();
    }

    _startRematchUI() {
        $turnPlayer.hide();
        $turnOpponent.hide();
        $gridPlayer.show();
        $gridOpponent.show();
        $btnResign.disable();
        $btnRematch.enable();
        $actionsPlay.show();

        if (this._won) {
            audioWin.stopAndPlay();
            $resultWin.show();
        } else {
            audioLoss.stopAndPlay();
            $resultLoss.show();
        }
        this.updateState();
        audioStart.stopAndPlay();
    }

    placeShips() {
        return new Promise((resolve, _) => {
            this.gridPlan.reset();
            this.gridPlan.place((success) => {
                if (success) {
                    $btnReady.enable();
                    return resolve();
                }

                return this.placeShips().then(() => this.waitTurn());
            });
        });
    }

    updateState() {
        console.log(this._revision, this._state.revision);
        if (this._revision === this._state.revision) {
            return;
        }
        this._revision = this._state.revision;

        this.gridPlan.set(this._player.ships, this._opponent.turns);
        this.gridPlan.drawPlanField();

        this.gridPlay.set(this._opponent.ships, this._player.turns);
        this.gridPlay.drawPlayField();
    }

    waitForConnect() {
        if (this._state.state === GameStatePlanning) {
            this._startPlanUI();
            return;
        }

        setTimeout(() => {
            return axios.get(`/api/game?gid=${this._gid}&pid=${this._pid}`)
                .then((res) => {
                    if (res.data.state === GameStatePlanning) {
                        this._state = res.data;
                        this._startPlanUI();
                    } else {
                        this.waitForConnect();
                    }
                })
                .catch(console.err)
        }, 1000);
    }

    game() {
        const gid = params.get('gid');
        const pid = params.get('pid');

        if (!gid && !pid) {
            return this._api.createGame(this._gid, this._size)
                .then((res) => {
                    this._state = res.data;
                })
                .then(() => {
                    if (!this._state.id) {
                        throw new Error('could not find game id');
                    }

                    this._gid = this._state.id;
                    this._pid = this._state.player2 ? this._state.player2.id : this._state.player1.id;

                    setQuery({
                        gid: this._gid,
                        pid: this._pid,
                    });
                })
                .catch(showError);
        } else if (!pid) {
            return this._api.joinGame(this._gid)
                .then((response) => {
                    this._state = response.data;
                })
                .then(() => {
                    if (!this._state.id) {
                        throw new Error('could not find game id');
                    }

                    this._gid = this._state.id;
                    this._pid = this._state.player2 ? this._state.player2.id : this._state.player1.id;

                    setQuery({
                        gid: this._gid,
                        pid: this._pid,
                    });
                })
                .catch(showError);
        } else {
            return this._api.game(this._gid, this._pid)
                .then((response) => {
                    this._state = response.data;
                    this._gid = gid;
                    this._pid = pid;

                    this._initGrids();

                    if (this._state.state === GameStateInitial) {
                        $waitingOpponent.show();
                        $gameLinkArea.show();
                        $gameLink.setLink();
                        this.waitForConnect();
                    } else if (this._state.state === GameStatePlanning) {
                        this.waitForConnect();
                    } else if (this._state.state === GameStatePlaying) {
                        this.waitGameBegin();
                    } else {
                        this.gameFinished();
                    }
                })
                .catch(showError);
        }
    }

    waitGameBegin() {
        $waitingOpponent.show();
        if (this._state.state === GameStatePlaying) {
            this._startPlayUI();
            return;
        }

        setTimeout(() => {
            return this._api.game(this._gid, this._pid)
                .then((res) => {
                    if (res.data.state === GameStatePlaying) {
                        this._state = res.data;
                        this._startPlayUI();
                    } else {
                        this.waitGameBegin();
                    }
                })
                .catch(console.err)
        }, 1000);
    }

    setShips() {
        return this._api.set(this._gid, this._pid, this.gridPlan.shipsSorted)
            .then((res) => {
                this._state = res.data;
                this.waitGameBegin();
            })
            .catch(showError);
    }


    doOpponentTurn() {
        if (!this._opponent.lastAction) {
            return;
        }

        if (this._lastOpponentTurn.id === this._opponent.lastAction.id) {
            return;
        }
        this._lastOpponentTurn = {
            id: this._opponent.lastAction.id,
            action: this._opponent.lastAction,
        };


        if (!this._opponent.lastAction.hitShipId.length) {
            audioMiss.stopAndPlay();
        } else {
            if (this._opponent.lastAction.sunk) {
                audioSink.stopAndPlay();
            } else {
                audioHit.stopAndPlay();
            }
        }

        this.updateState();
    }

    gameStatus() {
        return this._api.game(this._gid, this._pid)
            .then((response) => {
                this._state = response.data;
            });
    }

    onPlayerTurn() {
        return new Promise((resolve, reject) => {
            const refresh = () => {
                setTimeout(() => {
                    this.gameStatus()
                        .then(() => {
                            if (this.gameFinished()) {
                                resolve();
                                return;
                            }

                            // opponent's turn
                            if (this._state.nextPlayerId === '-') {
                                $turnPlayer.hide();
                                $turnOpponent.show();

                                this.doOpponentTurn();
                                refresh();
                                return;
                            }

                            this.doOpponentTurn();
                            this.updateState();
                            $turnOpponent.hide();
                            $turnPlayer.show();

                            resolve();
                        })
                        .catch(reject);
                }, 500);
            };

            refresh();
        });
    }

    waitTurn() {
        this.onPlayerTurn()
            .then(() => {
                if (this.gameFinished()) {
                    return;
                }

                if (this._state.state !== GameStatePlaying || this._state.nextPlayerId === '-') {
                    this.waitTurn();
                    return;
                }

                return this.check()
                    .then(() => {
                        if (this.gameFinished()) {
                            return;
                        }
                        $turnPlayer.hide();
                        $turnOpponent.show();

                        this.waitTurn();
                    });
            })
            .catch(showError);
    }

    check() {
        return new Promise((resolve, _) => {
            this.gridPlay.check(this._player.turns, (row, col) => {
                return resolve([row, col]);
            });
        })
        .then(([row, col]) => {
            return this._api.check(this._gid, this._pid, {
                row: row,
                col: col,
            })
                .then((res) => {
                    this._state = res.data;
                    const action = this._player.lastAction;
                    if (!action.hitShipId.length) {
                        audioMiss.stopAndPlay();
                    } else {
                        if (action.sunk) {
                            audioSink.stopAndPlay();
                        } else {
                            audioHit.stopAndPlay();
                        }
                     }
                    this.updateState();
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data.message === 'game is over') {
                            this.game();
                            return;
                        }
                    }

                    showError(err)
                });
        });
    }

    gameFinished() {
        if (this._finished) {
            return true;
        }

        if (!this._state.winnerPlayerId.length) {
            return false;
        }

        this._finished = true;
        this._won = this._state.winnerPlayerId === this._pid

        this._startRematchUI();

        return true;
    }

    resign() {
        return this._api.resign(this._gid, this._pid)
            .then((res) => {
                this._state = res.data;
                this.gameFinished();
            })
            .catch(console.err)
    }

    waitForRematch() {
        $waitingOpponent.show();
        const refresh = () => {
            setTimeout(() => {
                this.gameStatus()
                    .then(() => {
                        if (this._state.state === GameStateFinished) {
                            refresh();
                            return;
                        }

                        $waitingOpponent.hide();
                        document.location.reload();
                        this.game();
                    })
            }, 1000)
        }

        refresh();
    }

    rematch() {
        return this._api.rematch(this._gid, this._pid)
            .then((res) => {
                this._state = res.data;
                this.waitForRematch();
            })
            .catch(console.err)
    }
}