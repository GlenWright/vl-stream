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

/* Constants */
const PHASE_TYPES = {
    BAN: { text: 'Ban Phase 1', slot_text: 'Banning', time: 27 },
    BAN2: { text: 'Ban Phase 2', slot_text: 'Banning', time: 27 },
    PICK: { text: 'Pick Phase 1', slot_text: 'Picking', time: 27 },
    PICK2: { text: 'Pick Phase 1', slot_text: 'Picking', time: 27 },
    PREP: { text: 'Preparation', time: 60 },
    DELAY: { text: 'Delay', time: 180 }
}

const PHASES = [
    /* Ban Phase 1 */
    { slot: 0, type: PHASE_TYPES['BAN'], side: 'blue' },
    { slot: 5, type: PHASE_TYPES['BAN'], side: 'red' },
    { slot: 0, type: PHASE_TYPES['BAN'], side: 'blue' },
    { slot: 5, type: PHASE_TYPES['BAN'], side: 'red' },
    { slot: 0, type: PHASE_TYPES['BAN'], side: 'blue' },
    { slot: 5, type: PHASE_TYPES['BAN'], side: 'red' },
    /* Pick Phase 1 */
    { slot: 0, type: PHASE_TYPES['PICK'], side: 'blue' },
    { slot: 5, type: PHASE_TYPES['PICK'], side: 'red' },
    { slot: 6, type: PHASE_TYPES['PICK'], side: 'red' },
    { slot: 1, type: PHASE_TYPES['PICK'], side: 'blue' },
    { slot: 2, type: PHASE_TYPES['PICK'], side: 'blue' },
    { slot: 7, type: PHASE_TYPES['PICK'], side: 'red' },
    /* Ban Phase 2 */
    { slot: 5, type: PHASE_TYPES['BAN2'], side: 'red' },
    { slot: 0, type: PHASE_TYPES['BAN2'], side: 'blue' },
    { slot: 5, type: PHASE_TYPES['BAN2'], side: 'red' },
    { slot: 0, type: PHASE_TYPES['BAN2'], side: 'blue' },
    /* Pick Phase 2 */
    { slot: 8, type: PHASE_TYPES['PICK2'], side: 'red' },
    { slot: 3, type: PHASE_TYPES['PICK2'], side: 'blue' },
    { slot: 4, type: PHASE_TYPES['PICK2'], side: 'blue' },
    { slot: 9, type: PHASE_TYPES['PICK2'], side: 'red' },
    /* Preparation Phase */
    { slot: null, type: PHASE_TYPES['PREP'], side: 'middle' },
    /* Waiting Phase */
    { slot: null, type: PHASE_TYPES['DELAY'], side: 'middle' },
]

/* State */
let phase = 0
let timer = 0
let timeout
let currentPage = 'waiting'
let champSelect = {}
let blueTeam = {}
let redTeam = {}
let banCount = 0
let teams = []

function checkCurrentPage(pageName, res) {
    if (pageName !== currentPage) {
        res.redirect('/stream/' + currentPage)
    }
}

function runTimer() {
    clearTimeout(timeout)
    time = PHASES[phase].type.time
    timer = time

    (function countdown() {
        timer = seconds
        if (seconds-- > 0) timeout = setTimeout(countdown, 1000)
    })()
}

function fetchTeams() {
    http.get(process.env.TEAMS_URI, (resp) => {
        let data = ''

        resp.on('data', (chunk) => {
            data += chunk
        })

        resp.on('end', () => {
            console.log('Fetched Teams')
            teams = JSON.parse(data)
        })
    }).on('error', (err) => {
        console.log('Error: ' + err.message)
    })
}

function changePhase() {
    phase++
    streamio.emit('changePhase', PHASES[phase])
    runTimer()
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

    console.log(req.body)

    switch (etype) {
        case 'create':
            var summoners = req.body.summoners
blueTeam = teams['WSL Green']
redTeam = teams['Cnturion Academy']
            phase = 0
            banCount = 0
            champSelect = {
                phase: PHASES[phase],
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

            // Update stream clients
            streamio.emit('ban', {
                ban_slot: banCount,
                champ_id: champId,
                confirm: confirm
            })

            if (confirm) {
                banCount++
                champSelect.bans.push({ champ_id: champId })

                changePhase()
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
                pick_slot: slot,
                champ_id: champId,
                confirm: confirm
            })

            if (confirm) changePhase()

            break

        case 'delete':
            currentPage = 'starting-soon'
            changePhase()
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

    socket.on('changePage', (page) => {
        currentPage = page
        streamio.emit('changePage', page)
    })

    socket.on('updateTeams', () => {
        fetchTeams()
    })

    socket.on('swapTeams', () => {
        var tempTeam = blueTeam
        blueTeam = redTeam
        redTeam = tempTeam

        streamio.emit('teamChanges', {
            blue_team: blueTeam,
            red_team: redTeam,
        })
    })
})

streamio.on('connection', (socket) => {
    socket.emit('initData', {
        state: champSelect,
        blueTeam: blueTeam,
        redTeam: redTeam,
        timer: timer
    })
})


httpServer.listen(process.env.PORT)
console.log('Server started on port', process.env.PORT)
fetchTeams()
