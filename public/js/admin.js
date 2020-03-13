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
}

/* Socket Declaration */
socket.on('initData', (data) => {
    updateTeams(data.teams);

    $('#blueTeam').val(data.blueTeam.name);
    $('#redTeam').val(data.redTeam.name);

    data.champSelect.summoners.forEach(function(summoner, index) {
        $('#sn-' + index).val(summoner.name);
    });
});

socket.on('updateData', (data) => {
    //
});

/* View Buttons */
$('#champ-select').click(function() {
    socket.emit('changePage', 'champ-select');
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
$('.team-name').change(function() {
    markUnsaved(this);
});

$('.summoner-name').change(function() {
    markUnsaved(this);
});
