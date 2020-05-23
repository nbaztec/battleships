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

const $waitingArea = $('#waiting-area');

const $btnOrientIcon = $('#btn-orient i');
const $btnOrient = $.extend(button('#btn-orient'), {
    toggleIcon: function() {
        $btnOrientIcon.toggleClass('fa-grip-lines-vertical');
        $btnOrientIcon.toggleClass('fa-grip-lines');
    }
});
const $btnReset = button('#btn-reset');
const $btnReady = button('#btn-ready');
const $btnResign = button('#btn-resign');

const $actionsPlan = $('#actions-plan');
const $actionsPlay = $('#actions-play');

const $gridPlayer = $('#grid-player');
const $gridOpponent = $('#grid-opponent');


$gridPlayer.hide();
$gridOpponent.hide();
$actionsPlan.hide();
$actionsPlay.hide();

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