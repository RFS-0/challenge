"use strict";

var message = require("./message.js");


// https://github.com/websockets/ws


var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: 10000 });

var clients = [];

wss.on('connection', function connection(ws) {
    clients.push(ws);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send(JSON.stringify(message.RequestName));
});


// other events are
// close, error