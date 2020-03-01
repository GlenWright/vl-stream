var socket = window.socket;

var state = {
    phase: 'bans',
    summoners: [],
    bans: []
};

var tileRoot = 'http://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/';
var splashRoot = 'http://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/';

var blue_team = 'Blue Team';
var blue_logo = '';

var red_team = 'Red Team';
var red_logo = '';

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

function updateSummoner(slot, champ_id, confirm) {
    updateBackgroundImage('si-' + slot, splashRoot + champ_id + '/' + champ_id + '000.jpg');
}

// Init Socket Listeners
socket.on('changePhase', function(phase) {
    state.phase = phase;
    updateText('phase', phase);
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
        blue_logo = data.blue_logo;
        updateText('tn-0', blue_team);
        updateBackgroundImage('ti-0', blue_logo);
    }

    if (data.red_team !== red_team) {
        red_team = data.red_team;
        red_logo = data.red_logo;
        updateText('tn-1', red_team);
        updateBackgroundImage('ti-1', red_logo);
    }
});

socket.on('initData', function(data) {
    state = data.state;
    blue_team = data.blueTeam;
    blue_logo = data.blueLogo;
    red_team = data.redTeam;
    red_logo = data.redLogo;

    $('#phase').text(state.phase);
    $('#blue_team').text(blue_team);
    $('#blue_logo').text(blue_logo);
    $('#red_team').text(red_team);
    $('#red_logo').text(red_logo);

    if (state.summoners) {
        state.summoners.forEach(function(summoner, i) {
            $('#sn-' + i).text(summoner.name);

            if (summoner.champ_id) {
                // Set champ image
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
});
