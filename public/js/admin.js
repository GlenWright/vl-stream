var socket = io('http://localhost:4004');

$('#press-me').click(function (e) {
    socket.emit('changePage', 'doit');
});
