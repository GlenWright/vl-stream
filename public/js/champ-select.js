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

var blueTeam = {};
var redTeam = {};

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
    if (champ_id === 0) {
        updateBackgroundImage('b-' + slot, '/img/no-ban.png');
    } else {
        updateBackgroundImage('b-' + slot, tileRoot + champ_id + '/' + champ_id + '000.jpg');
    }
}

function updateSummoner(slot, champ_id) {
    updateBackgroundImage('si-' + slot, splashRoot + champ_id + '/' + champ_id + '000.jpg');
}

function startTimer(time) {
    clearTimeout(timeout);
    $('.timer').text('');

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

socket.on('trade', function(data) {
    var slot = data.pick_slot;
    var champ_id = data.champ_id;

    state.summoners[slot].champ_id = champ_id;

    updateSummoner(slot, champ_id, true);
});

socket.on('teamChanges', function(data) {
    if (data.blueTeam !== blueTeam) {
        blueTeam = data.blueTeam;
        updateText('tn-0', blueTeam.name);
        updateBackgroundImage('ti-0', blueTeam.logo);
    }

    if (data.redTeam !== redTeam) {
        redTeam = data.redTeam;
        updateText('tn-1', redTeam.name);
        updateBackgroundImage('ti-1', redTeam.logo);
    }
});

socket.on('summonerChanges', function(data) {
    state.summoners = data.summoners;

    data.summoners.forEach(function(summoner, i) {
        updateText('sn-' + i, summoner.name);
    });
});

socket.on('initData', function(data) {
    console.log(data)

    timer = data.timer
    state = data.state;
    blueTeam = data.blueTeam;
    redTeam = data.redTeam;

    $('#phase').text(state.phase.type.text);
    $('.timer.blue').text('');
    $('.timer.red').text('');
    $('.timer.both').text('');

    $('#tn-0').text(blueTeam.name);
    $('#ti-0').css(
        'background-image',
        'url(' + blueTeam.logo + ')'
    );

    $('#tn-1').text(redTeam.name);
    $('#ti-1').css(
        'background-image',
        'url(' + redTeam.logo + ')'
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
    } else {
        startTimer(state.phase.type.time);
        moveCursor();
    }
});
