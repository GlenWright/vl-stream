var socket = io('http://localhost:4004/stream');

socket.on('changePage', function(page) {
    location.href = 'http://localhost:4004/stream/' + page;
});
