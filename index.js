"use strict";
var websocket = require('websocket-stream');
var url = require('url');
var stream_url = require('stream-url');

// register URL adaptors for ws streams
stream_url.register('ws:', ws_listen, ws_connect);
//stream_url.register('wss:', ws_listen, ws_connect);

function ws_listen (stream_url, options, callback) {
    var parsed = url.parse(stream_url);
    var ws_server = new websocket.Server({
        host: parsed.hostname || '127.0.0.1',
        port: parsed.port || 80,
        path: parsed.path || null
    });
    // WebSocket.Server does not have 'listening' event
    if (callback) {
        process.nextTick(function () { callback(null, ws_server); });
    }
    return ws_server;
}

function ws_connect (stream_url, options, callback) {
    var stream = websocket(stream_url.href);
    if (callback) {
        stream.on('connect', function () {
            callback(null, stream);
        });
    }
    return stream;
}

module.exports = stream_url;
