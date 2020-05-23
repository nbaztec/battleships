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

class API {
    constructor() {
        this._gid = null;
        this._pid = null;
        this._state = {};
        this.grid = null;
        this.gridPlay = null;
        this._revision = null;
        this._lastOpponentTurn = {
            revision: null,
            action: null,
        };

        this.gridPlan = new GridPlan('grid-player', {});
        this.gridPlay = new GridPlay('grid-opponent', {});
    }

    get _player() {
        return this._state.player1.id !== '-' ? this._state.player1 : this._state.player2;
    }

    get _opponent() {
        return this._state.player1.id === '-' ? this._state.player1 : this._state.player2;
    }

    _startPlanUI() {
        $waitingArea.hide();
        $actionsPlan.show();
        $gridPlayer.show();
        $btnReset.enable();

        audioStart.play().catch(console.log);

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
        $waitingArea.hide();
        $gridPlayer.show();
        $gridOpponent.show();
        $actionsPlan.hide();
        $actionsPlay.show();

        audioStart.play().catch(console.log);

        this.updateState();
        this.waitTurn();
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
        if (this._revision === this._state.revision) {
            return;
        }
        this._revision = this._state.revision;

        this.gridPlan.set(this._player.ships, this._opponent.turns);
        this.gridPlan.drawPlanField();

        this.gridPlay.set(this._opponent.ships, this._player.turns);
        this.gridPlay.drawPlayField();
    }

    wait() {
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
                        this.wait();
                    }
                })
                .catch(console.err)
        }, 1000);
    }

    game() {
        const gid = params.get('gid');
        const pid = params.get('pid');

        if (!gid && !pid) {
            return axios.get('/api/game')
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
            return axios.get(`/api/game?gid=${gid}`)
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
            $gameLink.setLink();
            return axios.get(`/api/game?gid=${gid}&pid=${pid}`)
                .then((response) => {
                    this._state = response.data;
                    this._gid = gid;
                    this._pid = pid;

                    if ([GameStateInitial, GameStatePlanning].includes(this._state.state)) {
                        this.wait();
                    } else if ([GameStatePlaying].includes(this._state.state)) {
                        this.waitGameBegin();
                    } else {
                        this.hasWon();
                    }
                })
                .catch(showError);
        }
    }

    waitGameBegin() {
        if (this._state.state === GameStatePlaying) {
            this._startPlayUI();
            return;
        }

        setTimeout(() => {
            return axios.get(`/api/game?gid=${this._gid}&pid=${this._pid}`)
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
        const gid = params.get('gid');
        const pid = params.get('pid');

        if (!gid || !pid) {
            return Promise.reject(new Error('gid & pid not set'));
        }

        return axios.post(`/api/set?gid=${gid}&pid=${pid}`, this.gridPlan.shipsSorted)
            .then((res) => {
                this._state = res.data;
                $btnReady.disable();
                $btnReset.disable();
                $btnOrient.disable();
                this.waitGameBegin();
            })
            .catch(showError);
    }


    doOpponentTurn() {
        if (this._lastOpponentTurn.revision === this._state.revision) {
            return;
        }
        this._lastOpponentTurn = {
            revision: this._state.revision,
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

    onPlayerTurn() {
        return new Promise((resolve, reject) => {
            const refresh = () => {
                setTimeout(() => {
                    axios.get(`/api/game?gid=${this._gid}&pid=${this._pid}`)
                        .then((response) => {
                            this._state = response.data;

                            // opponent's turn
                            if (response.data.nextPlayerId === '-') {
                                this.doOpponentTurn();
                                refresh();
                                return;
                            }

                            this.updateState();
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
                if (this.hasWon()) {
                    return;
                }

                if (this._state.state !== GameStatePlaying || this._state.nextPlayerId === '-') {
                    this.waitTurn();
                    return;
                }

                return this.check()
                    .then(() => {
                        if (this.hasWon()) {
                            return;
                        }

                        this.waitTurn();
                    });
            })
            .catch(showError);
    }

    check() {
        const gid = params.get('gid');
        const pid = params.get('pid');

        if (!gid || !pid) {
            return Promise.reject(new Error('gid & pid not set'));
        }

        return new Promise((resolve, _) => {
            this.gridPlay.check(this._player.turns, (row, col) => {
                console.log("check!", row, col)
                return resolve([row, col]);
            });
        })
        .then(([row, col]) => {
            return axios.post(`/api/check?gid=${gid}&pid=${pid}`, {
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
                .catch(showError);
        });
    }

    hasWon() {
        if (!this._state.winnerPlayerId.length) {
            return false;
        }

        const msg = (this._state.winnerPlayerId === this._pid) ? 'you won :D' : 'opponent won :(';
        alert(msg);

        return false;
    }
}