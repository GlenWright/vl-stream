window.socket = io(window.location.origin + '/stream');

window.socket.on('changePage', function(page) {
    location.href = window.location.origin + '/stream/' + page;
});
