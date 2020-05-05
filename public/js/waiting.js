var socket = window.socket;

var blueTeam = {};
var redTeam = {};
var blueScore = '';
var redScore = '';

var week = '';
var day = '';
var stage = '';
var groupHead = '';
var groupSub = '';

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

function updateBackgroundColor(id, value) {
    $('#' + id).css(
        'background-color',
        value
    );
}

// Init Socket Listeners
socket.on('teamChanges', function(data) {
    if (data.blueTeam !== blueTeam) {
        blueTeam = data.blueTeam;
        blueScore = data.blueScore;
        updateText('blueTeam', blueTeam.name);
        updateBackgroundImage('blueLogo', blueTeam.logo);
        updateBackgroundColor('team-blue-colour', blueTeam.colour);
        updateText('blueScore', blueScore);
    }

    if (data.redTeam !== redTeam) {
        redTeam = data.redTeam;
        redScore = data.redScore;
        updateText('redTeam', redTeam.name);
        updateBackgroundImage('redLogo', redTeam.logo);
        updateBackgroundColor('team-red-colour', redTeam.colour);
        updateText('redScore', redScore);
    }
});

socket.on('textChanges', function(data) {
    week = data.week;
    day = data.day;
    stage = data.stage;
    groupHead = data.groupHead;
    groupSub = data.groupSub;

    updateText('week', week);
    updateText('day', day);
    updateText('stage', stage);
    updateText('groupHead', groupHead);
    updateText('groupSub', groupSub);
});

socket.on('initData', function(data) {
    console.log(data)

    blueTeam = data.blueTeam;
    redTeam = data.redTeam;
    blueScore = data.blueScore;
    redScore = data.redScore;
    week = data.week;
    day = data.day;
    stage = data.stage;
    groupHead = data.groupHead;
    groupSub = data.groupSub;

    $('#blueTeam').text(blueTeam.name);
    $('#blueLogo').css(
        'background-image',
        'url(' + blueTeam.logo + ')'
    );
    $('#team-blue-colour').css(
        'background-color',
        blueTeam.colour
    );

    $('#redTeam').text(redTeam.name);
    $('#redLogo').css(
        'background-image',
        'url(' + redTeam.logo + ')'
    );
    $('#team-red-colour').css(
        'background-color',
        redTeam.colour
    );

    $('#blueScore').text(blueScore);
    $('#redScore').text(redScore);

    $('#week').text(week);
    $('#day').text(day);
    $('#stage').text(stage);
    $('#groupHead').text(groupHead);
    $('#groupSub').text(groupSub);
});
