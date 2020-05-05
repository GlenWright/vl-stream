var socket = window.socket;

var blueTeam = {};
var redTeam = {};

var blueScore = 0;
var redScore = 0;

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
        blueScore = data.blueScore;
        updateText('blueTeam', blueTeam.tag);
        updateText('blueScore', blueScore);
    }

    if (data.redTeam !== redTeam) {
        redTeam = data.redTeam;
        redScore = data.redScore;
        updateText('redTeam', redTeam.tag);
        updateText('redScore', redScore);
    }
});

socket.on('initData', function(data) {
    console.log(data)

    blueTeam = data.blueTeam;
    redTeam = data.redTeam;

    blueScore = data.blueScore
    redScore = data.redScore;

    $('#blueTeam').text(blueTeam.tag);
    $('#redTeam').text(redTeam.tag);

    $('#blueScore').text(blueScore);
    $('#redScore').text(redScore);

    var game = 1 + parseInt(blueScore) + parseInt(redScore);
    $('#game').text(game);
});
