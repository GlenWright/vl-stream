var socket = io(window.location.href);

$('#press-me').click(function (e) {
    socket.emit('changePage', 'doit');
});
