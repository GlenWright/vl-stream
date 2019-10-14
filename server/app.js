require('dotenv').config()

const http = require('http')
const express = require('express')
const app = express()
const httpServer = http.createServer(app)

const io = require('socket.io').listen(httpServer, { log: true })
const streamio = io.of('/stream')

const pug = require('pug')
const bodyParser = require('body-parser')

var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()

app.use(express.static(__dirname + '/../public'))
app.set('view engine', 'pug')
app.set('views', __dirname + '/../public/views')


/* Data */
let currentPage = 'waiting'
let champSelect = {}
let blueTeam = 'Blue Team'
let blueLogo = ''
let redTeam = 'Red Team'
let redLogo = ''
let banCount = 0
let pickCount = 0


function checkCurrentPage(pageName, res) {
    if (pageName !== currentPage) {
        res.redirect('/stream/' + currentPage)
    }
}


/* Routes */
app.get('/', function(req, res) {
    res.render('index')
})

app.get('/stream/waiting', function(req, res) {
    checkCurrentPage('waiting', res)
    res.render('waiting')
})

app.get('/stream/starting-soon', function(req, res) {
    checkCurrentPage('starting-soon', res)
    res.render('starting-soon')
})

app.get('/stream/champ-select', function(req, res) {
    checkCurrentPage('champ-select', res)
    res.render('champ-select')
})

app.post('/events/champ-select', jsonParser, function(req, res) {
    var etype = req.body.etype

    switch (etype) {
        case 'create':
            var summoners = req.body.summoners

            banCount = 0
            pickCount = 0
            champSelect = {
                phase: 'bans',
                summoners: [],
                bans: []
            }

            Object.values(summoners).forEach(summoner => {
                champSelect.summoners.push({
                    name: summoner,
                    champ_id: null,
                    locked: false
                })
            })

            // Update stream clients
            currentPage = 'champ-select'
            streamio.emit('changePage', 'champ-select')

            break

        case 'ban':
            var champId = req.body.champ_id
            var confirm = req.body.confirm

            champSelect.bans.push({ champ_id: champId })

            // Update stream clients
            streamio.emit('ban', {
                ban_slot: banCount,
                champ_id: champId,
                confirm: confirm
            })

            if (confirm) banCount++

            // Check phase
            var newPhase = champSelect.phase

            if (banCount === 6) newPhase = 'picks' // Begin pick phase
            if (banCount === 10) newPhase = 'picks' // Begin pick phase 2

            if (champSelect.phase !== newPhase) {
                champSelect.phase = newPhase

                streamio.emit('phaseChange', newPhase)
            }

            break

        case 'pick':
            var champId = req.body.champ_id
            var confirm = req.body.confirm
            var slot = req.body.cell_id

            var summoner = champSelect.summoners[slot]
            summoner.champ_id = champId
            summoner.locked = confirm

            // Update stream clients
            streamio.emit('pick', {
                pick_slot: pickCount,
                champ_id: champId,
                confirm: confirm
            })

            if (confirm) pickCount++

            // Check phase
            var newPhase = champSelect.phase

            if (pickCount === 6) newPhase = 'bans' // Begin ban phase 2
            if (pickCount === 10) newPhase = 'preparation' // Begin prep phase

            if (champSelect.phase !== newPhase) {
                champSelect.phase = newPhase

                streamio.emit('phaseChange', newPhase)
            }

            break

        case 'delete':
            currentPage = 'starting-soon'
            streamio.emit('changePage', 'starting-soon')
            break

        default:
            console.log('Unknown etype received:', etype)
            break
    }

    res.end(JSON.stringify(req.body, null, 2))
})


/* Socket Events */
io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('requestInit', (fn) => {
        // update with latest details
        fn({
            state: champSelect,
            blueTeam: blueTeam,
            redTeam: redTeam
        })
    })

    socket.on('changePage', (page) => {
        currentPage = page
        streamio.emit('changePage', page)
    })

    socket.on('swapTeams', () => {
        var tempTeam = blueTeam
        blueTeam = redTeam
        redTeam = tempTeam

        var tempLogo = blueLogo
        blueLogo = redLogo
        redLogo = tempLogo

        streamio.emit('teamChanges', {
            blue_team: blueTeam,
            blue_logo: blueLogo,
            red_team: redTeam,
            red_logo: redLogo
        })
    })
})


httpServer.listen(process.env.PORT)
console.log('Server started on port', process.env.PORT)
