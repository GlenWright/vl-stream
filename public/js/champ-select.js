var socket = window.socket;

var state = {
    phase: {},
    summoners: [],
    bans: []
};

var timer = 0;
var timeout;

var tileRoot = 'http://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/';
var splashRoot = 'http://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/';

var blue_team = {};
var red_team = {};

function updateText(id, text) {
    var $element = $('#' + id);
    $element.fadeOut(function() {
        $element.text(text);
        $element.fadeIn();
    });
}

function updateAttribute(id, attr, value) {
    var $element = $('#' + id);
    $element.fadeOut(function() {
        $element.attr(attr, value);
        $element.fadeIn();
    });
}

function updateBackgroundImage(id, value) {
    $('#' + id).css(
        'background-image',
        'url(' + value + ')'
    );
}

function updateBan(slot, champ_id) {
    updateBackgroundImage('b-' + slot, tileRoot + champ_id + '/' + champ_id + '000.jpg');
}

function updateSummoner(slot, champ_id) {
    updateBackgroundImage('si-' + slot, splashRoot + champ_id + '/' + champ_id + '000.jpg');
}

function startTimer(time) {
    clearTimeout(timeout);
    var side = state.phase.side;

    timer = time, $seconds = document.querySelector('.timer.' + side);
    (function countdown() {
        minutes = Math.floor(timer / 60);
        seconds = timer % 60;
        $seconds.textContent = (minutes > 0 ? minutes : '' ) + ':' + (seconds < 10 ? '0' : '') + seconds;
        if (timer-- > 0) timeout = setTimeout(countdown, 1000);
    })();
}

function moveCursor() {
    var slot = state.phase.slot;

    if (state.phase.type.slot_text && slot !== null) {
        var slotText = state.phase.type.slot_text;

        $('.player-message').text('');
        updateText('sm-' + slot, slotText);
    }
}

// Init Socket Listeners
socket.on('changePhase', function(phase) {
    state.phase = phase;
    updateText('phase', state.phase.type.text);
    startTimer(state.phase.type.time);
    moveCursor();
});

socket.on('ban', function(data) {
    var slot = data.ban_slot;
    var champ_id = data.champ_id;
    var confirm = data.confirm;

    state.bans.push({ champ_id: champ_id });

    updateBan(slot, champ_id, confirm);
});

socket.on('pick', function(data) {
    var slot = data.pick_slot;
    var champ_id = data.champ_id;
    var confirm = data.confirm;

    var summoner = state.summoners[slot];
    summoner.champ_id = champ_id;
    summoner.locked = confirm;

    updateSummoner(slot, champ_id, confirm);
});

socket.on('teamChanges', function(data) {
    if (data.blue_team !== blue_team) {
        blue_team = data.blue_team;
        updateText('tn-0', blue_team.name);
        updateBackgroundImage('ti-0', blue_logo.logo);
    }

    if (data.red_team !== red_team) {
        red_team = data.red_team;
        updateText('tn-1', red_team.name);
        updateBackgroundImage('ti-1', red_logo.logo);
    }
});

socket.on('initData', function(data) {
    console.log(data)

    timer = data.timer
    state = data.state;
    blue_team = data.blue_team;
    red_team = data.red_team;

    $('#phase').text(state.phase.type.text);
    $('.timer.blue').text('');
    $('.timer.red').text('');
    $('.timer.both').text('');

    $('#tn-0').text(blue_team.name);
    $('#ti-0').css(
        'background-image',
        'url(' + blue_team.logo + ')'
    );

    $('#tn-1').text(red_team.name);
    $('#ti-1').css(
        'background-image',
        'url(' + red_team.logo + ')'
    );

    if (state.summoners) {
        state.summoners.forEach(function(summoner, i) {
            $('#sn-' + i).text(summoner.name);

            if (summoner.champ_id) {
                // Set picked champs
                $('#si-' + i).css(
                    'background-image',
                    'url(' + splashRoot + summoner.champ_id + '/' + summoner.champ_id + '000.jpg)'
                );
            }
        });
    }

    if (state.bans) {
        state.bans.forEach(function(ban, i) {
            // Set banned champs
            $('#b-' + i).css(
                'background-image',
                'url(' + tileRoot + ban.champ_id + '/' + ban.champ_id + '000.jpg'
            );
        });
    }

    if (timer > 0) {
        startTimer(timer);
    }
});
