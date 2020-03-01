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

function updateBan(slot, champ_id) {
    $('#ban_' + slot).text(champ_id);
}

function updateSummoner(slot, champ_id, confirm) {
    $('#summoner_' + slot).append(champ_id);
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
        updateText('blue_team', blue_team);
        updateText('blue_logo', 'src', blue_logo);
    }

    if (data.red_team !== red_team) {
        red_team = data.red_team;
        red_logo = data.red_logo;
        updateText('red_team', red_team);
        updateAttribute('red_logo', 'src', red_logo);
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

    state.bans.forEach(function(ban, i) {
        // Set banned champs
        $('#b-' + i).css(
            'background-image',
            'url(' + tileRoot + ban.champ_id + '/' + ban.champ_id + '000.jpg'
        );
    });
});
