"use strict";
var websocket = require('websocket-stream');
var url = require('url');
var stream_url = require('stream-url');
var EventEmitter = require('eventemitter3');

// register URL adaptors for ws streams
stream_url.register('ws:', ws_listen, ws_connect);
stream_url.register('wss:', ws_listen, ws_connect);

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
        var on_connect = function () {
            stream.removeListener('error', on_error);

            // EXPERIMENTAL: websocket ping-pong based keep-alive
            if (options && options.interval) {
                enable_ws_keepalive(stream,
                                    options.interval,
                                    options.timeout || options.interval * 3);
            }

            callback(null, stream);
        };
        var on_error = function (e) {
            stream.removeListener('connect', on_connect);
            callback(e, null);
        }
        stream.once('connect', on_connect);
        stream.once('error', on_error);

    }
    return stream;
}

function enable_ws_keepalive(ws, intervalMs, timeoutMs) {
    if (!ws || !ws.socket) {
        return;
    }

    var timestamp = Date.now();

    function update_timestamp () {
        timestamp = Date.now();
    }

    ws.socket.on('pong', update_timestamp);
    var interval = setInterval(function () {
        var ok = true;

        if (ws.socket) {
            try {
                ws.socket.ping();
            } catch (e) {
                ok = false;
            }
        } else {
            ok = false;
        }

        var now = Date.now();
        if (now - timestamp >= timeoutMs) {
            ok = false;
        }

        if (!ok) {
            if (ws.socket) ws.socket.removeListener('pong', update_timestamp);
            clearInterval(interval);
            interval = null;
            ws.end();
        }
    }, intervalMs);

    ws.on('close', function () {
        if (interval) {
            if (ws.socket) ws.socket.removeListener('pong', update_timestamp);
            clearInterval(interval);
            interval = null;
        }
    });
}

module.exports = stream_url;
