"use strict";
var websocket = require('websocket-stream');
var url = require('url');
var stream_url = require('stream-url');
var EventEmitter = require('eventemitter3');

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

    var server_wrap = new EventEmitter();
    ws_server.on('stream', function (stream) {
        server_wrap.emit('connection', stream);
    });
    server_wrap.close = function () {
        ws_server.close();
    };

    // WebSocket.Server does not have 'listening' event
    if (callback) {
        setTimeout(function () { callback(null, server_wrap); }, 0);
    }
    return server_wrap;
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
