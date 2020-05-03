var socket = window.socket;

var blueScore = 0;
var redScore = 0;

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

// Init Socket Listeners
socket.on('teamChanges', function(data) {
    if (data.blueTeam !== blueTeam) {
        blueTeam = data.blueTeam;
        updateText('blue-team', blueTeam.name);
    }

    if (data.redTeam !== redTeam) {
        redTeam = data.redTeam;
        updateText('red-team', redTeam.name);
    }
});

socket.on('scoreChanges', function(data) {
    if (data.blueScore !== blueScore) {
        blueScore = data.blueScore;
        updateText('blue-score', blueScore);
    }

    if (data.redScore !== redScore) {
        redScore = data.redScore;
        updateText('red-score', redScore);
    }
});

socket.on('initInGame', function(data) {
    console.log(data)

    blueScore = data.blueScore
    redScore = data.redScore;
    blueTeam = data.blueTeam;
    redTeam = data.redTeam;

    $('#blue-score').text(blueScore);
    $('#red-score').text(redScore);

    $('#blue-team').text(blueTeam.name);
    $('#red-team').text(redTeam.name);
});
