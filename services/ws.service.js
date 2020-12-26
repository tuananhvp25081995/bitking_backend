const { v1: uuidv1 } = require('uuid');
let Websocket = require('ws')

const WebSocketService = {}

let wss;
let webSockets = {}

WebSocketService.connect = (port) => {
    wss = new Websocket.Server({ port: port });
    wss.on('connection', function (ws, req) {
        ws.id = uuidv1()
        let userID = req.url.substr(1)
        if (!(userID in webSockets)) {
            webSockets[userID] = {}
        }
        webSockets[userID][ws.id] = ws
        console.log('connected: ' + userID + ' in ' + ws.id)

        ws.on('close', function () {
            delete webSockets[userID][ws.id]
            console.log('deleted: ' + userID)
        })
    })
    wss.on('error', (err) => {
        console.log(err)
    })
    console.log(`WebSocket listening on port ${port}`);
}

WebSocketService.sendToAllClient = (msg) => {
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(msg));
    });
};

WebSocketService.sendToOneClient = (userID, msg) => {
    let data = webSockets[userID];
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            data[key].send(JSON.stringify(msg))
        }
    }
};

module.exports = WebSocketService