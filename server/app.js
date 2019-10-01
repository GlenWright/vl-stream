require('dotenv').config()

const http = require('http')
const express = require('express')
const app = express()
const httpServer = http.createServer(app)

const io = require('socket.io').listen(httpServer, { log: true })
const streamio = io.of('/stream')

const pug = require('pug')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static(__dirname + '/../public'))
app.set('view engine', 'pug')
app.set('views', __dirname + '/../public/views')


/* Data */
let currentPage = 'waiting'


/* Routes */
app.get('/', function(req, res) {
    res.render('index')
})

app.get('/stream/waiting', function(req, res) {
    res.render('waiting')
})

app.get('/stream/starting-soon', function(req, res) {
    res.render('starting-soon')
})

app.get('/stream/champ-select', function(req, res) {
    res.render('champ-select')
})

app.post('/events/champ-select', function(req, res) {
    console.log(req.body)
    console.log(req.body.test)
    res.end(JSON.stringify(req.body, null, 2))
})


/* Socket Events */
io.on('connection', (socket) => {
    // update with latest details
    console.log(socket.id)

    socket.on('changePage', (page) => {
        streamio.emit('changePage', page)
    })
})


httpServer.listen(process.env.PORT)
console.log('Server started on port', process.env.PORT)
