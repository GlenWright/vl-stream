var socket = io(window.location.origin);

/* View Manipulation */
function changeSaveState(self, newState) {
    var $parent = $(self).closest('.card');
    $parent.removeClass('unsaved');
    $parent.removeClass('saved');

    $parent.addClass(newState);
}

function markUnsaved(self) {
    changeSaveState(self, 'unsaved');
}

function markSaved(self) {
    changeSaveState(self, 'saved');
}

function updateTeams(teams) {
    var blue = $('#blueTeam').val();
    var red = $('#redTeam').val();
    console.log(teams);

    var tArr = Object.keys(teams);
    tArr.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    if (tArr.length > 0) {
        $('#blueTeam').html('<option selected="selected" disabled="disabled">Please select Blue team</option>');
        $('#redTeam').html('<option selected="selected" disabled="disabled">Please select Red team</option>');

        tArr.forEach(function(team) {
            var val = '<option value="' + team + '">' + team + '</option>';
            $('#blueTeam').append(val);
            $('#redTeam').append(val);
        });
    }

    if (blue) {
        $('#blueTeam [value="' + blue + '"]').attr('selected', true);
    }

    if (red) {
        $('#redTeam [value="' + red + '"]').attr('selected', true);
    }
}

/* Random Functions */
function saveSummoners() {
    var summoners = {
        0: $('#sn-0').val(),
        1: $('#sn-1').val(),
        2: $('#sn-2').val(),
        3: $('#sn-3').val(),
        4: $('#sn-4').val(),
        5: $('#sn-5').val(),
        6: $('#sn-6').val(),
        7: $('#sn-7').val(),
        8: $('#sn-8').val(),
        9: $('#sn-9').val(),
    };

    socket.emit('saveSummoners', summoners, function(data) {
        if (data.success) {
            markSaved($('#save-summoners-blue'));
            markSaved($('#save-summoners-red'));
        }
    });
}

/* Socket Declaration */
socket.on('initData', (data) => {
    updateTeams(data.teams);

    $('#blueTeam').val(data.blueTeam.name);
    $('#redTeam').val(data.redTeam.name);

    $('#blueScore').val(data.blueScore);
    $('#redScore').val(data.redScore);

    data.champSelect.summoners.forEach(function(summoner, index) {
        $('#sn-' + index).val(summoner.name);
    });

    $('#week').val(data.week);
    $('#day').val(data.day);
    $('#stage').val(data.stage);
    $('#groupHead').val(data.groupHead);
    $('#groupSub').val(data.groupSub);
});

socket.on('updateData', (data) => {
    //
});

socket.on('teamChanges', (data) => {
    $('option').attr('selected', false);

    $('#blueTeam [value="' + data.blueTeam.name + '"]').attr('selected', true);
    $('#redTeam [value="' + data.redTeam.name + '"]').attr('selected', true);
    $('#blueScore').val(data.blueScore);
    $('#redScore').val(data.redScore);
})

/* View Buttons */
$('#waiting').click(function() {
    socket.emit('changePage', 'waiting');
});

$('#champ-select').click(function() {
    socket.emit('changePage', 'champ-select');
});

$('#in-game').click(function() {
    socket.emit('changePage', 'in-game');
});

/* Quick Functions */
$('#swap-sides').click(function() {
    socket.emit('swapTeams');
});

$('#refresh-teams').click(function() {
    socket.emit('refreshTeams', function(data) {
        updateTeams(data);
    });
});

/* Input Changes */
$('.team-name, .score').change(function() {
    markUnsaved(this);
});

$('.summoner-name').change(function() {
    markUnsaved(this);
});

$('.split-info').change(function() {
    markUnsaved(this);
});

/* Save Buttons */
$('#save-teams').click(function() {
    var self = this;
    var teams = {
        blueTeam: $('#blueTeam').val(),
        redTeam: $('#redTeam').val(),
        blueScore: $('#blueScore').val(),
        redScore: $('#redScore').val(),
    };

    socket.emit('saveTeams', teams, function(data) {
        if (data.success) {
            markSaved(self);
        }
    });
});

$('#save-summoners-blue').click(function() {
    saveSummoners();
});

$('#save-summoners-red').click(function() {
    saveSummoners();
});

$('#save-text').click(function() {
    var self = this;
    var text = {
        week: $('#week').val(),
        day: $('#day').val(),
        stage: $('#stage').val(),
        groupHead: $('#groupHead').val(),
        groupSub: $('#groupSub').val(),
    };

    socket.emit('saveText', text, function(data) {
        if (data.success) {
            markSaved(self);
        }
    });
});
