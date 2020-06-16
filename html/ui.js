let VerticalMode = false;

const $gameLink = $.extend({}, $('#game-link'), {
    setLink: function() {
        const url = new URL(document.location);
        const newParams = new URLSearchParams();
        newParams.set('gid', url.searchParams.get('gid'));
        url.searchParams = newParams;
        url.search = newParams.toString();

        this.text(url.toString());
    }
});

const $startArea = $('#start-area');
const $joinGame = $('#join-game');
const $createGame = $('#create-game');

const $waitingOpponent = $('#waiting-opponent');
const $gameLinkArea = $('#game-link-area');

const $btnOrientIcon = $('#btn-orient i');
const $btnOrient = $.extend(button('#btn-orient'), {
    toggleIcon: function() {
        $btnOrientIcon.toggleClass('fa-grip-lines-vertical');
        $btnOrientIcon.toggleClass('fa-grip-lines');
    }
});
const $btnReset = button('#btn-reset');
const $btnReady = button('#btn-ready');
const $btnPlanResign = button('#btn-plan-resign');
const $btnResign = button('#btn-resign');
const $btnRematch = button('#btn-rematch');

const $actionsPlan = $('#actions-plan');
const $actionsPlay = $('#actions-play');

const $turnPlayer = $('#turn-player');
const $turnOpponent = $('#turn-opponent');

const $gridPlayer = $('#grid-player');
const $gridOpponent = $('#grid-opponent');

const $resultWin = $('#result-win');
const $resultLoss = $('#result-loss');

$waitingOpponent.hide();
$gameLinkArea.hide();
$turnPlayer.hide();
$turnOpponent.hide();
$gridPlayer.hide();
$gridOpponent.hide();
$actionsPlan.hide();
$actionsPlay.hide();
$resultWin.hide();
$resultLoss.hide();

function button(id) {
    return $.extend({}, $(id), {
        enabled: function () {
            return !this.hasClass('disabled');
        },
        enable: function () {
            this.removeClass('disabled');
        },
        disable: function () {
            this.addClass('disabled');
        },
    })
}

$(function() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') { // SHIFT key
            $btnOrient.click();
        }
    });

    $joinGame.submit((e) => {
        const gameId = $joinGame.find('input[name=game-id]').val();
        gameMaster.joinGame(gameId)
            .catch(alert);

        e.preventDefault();
    });

    $createGame.submit((e) => {
        const gameId = $createGame.find('input[name=game-id]').val();
        const gridSize = $createGame.find('input[name=grid-size]').val();
        const shipCount = $createGame.find('input[name=ship-count]').val();

        gameMaster.createGame(gameId, gridSize, shipCount)
            .catch(alert);
        e.preventDefault();
    })

    $btnOrient.click((e) => {
        VerticalMode = !VerticalMode;
        $btnOrient.toggleIcon();
    });

    $btnReset.click(() => {
        if (!$btnReset.enabled()) {
            return;
        }

        gameMaster.placeShips().catch(console.error);
    });

    $btnReady.click(() => {
        if (!$btnReady.enabled()) {
            return;
        }

        gameMaster.setShips()
            .then(() => {
                $btnReady.disable();
                $btnOrient.disable();
            })
            .catch(console.error);
    });

    $btnPlanResign.click(() => {
        if (!$btnPlanResign.enabled()) {
            return;
        }

        gameMaster.resignPlan()
            .then(() => {
                $actionsPlan.hide();
                $actionsPlay.show();
                $btnPlanResign.disable();
                $btnReady.disable();
            })
            .catch(console.error);
    });

    $btnResign.click(() => {
        if (!$btnResign.enabled()) {
            return;
        }

        gameMaster.resign()
            .then(() => {
                $btnResign.disable();
                $btnRematch.enable();
            })
            .catch(console.error);
    });

    $btnRematch.click(() => {
        if (!$btnRematch.enabled()) {
            return;
        }

        $resultWin.hide();
        $resultLoss.hide();
        $turnPlayer.hide();
        $turnOpponent.hide();

        gameMaster.rematch()
            .then(() => {
                $btnRematch.disable();
                $btnResign.disable();
            })
            .catch(console.error);
    })
});