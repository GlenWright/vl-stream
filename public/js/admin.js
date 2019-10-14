var socket = io(window.location.origin);

$('#press-me').click(function() {
    socket.emit('changePage', 'champ-select');
});

$('#swap-teams').click(function() {
    socket.emit('swapTeams');
});
