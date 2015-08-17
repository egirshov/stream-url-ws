"use strict";
var WebSocket = require('ws');
var url = require('url');
var stream_url = require('stream-url');

// register URL adaptors for ws streams
stream_url.register('ws:', ws_listen, ws_connect);
//stream_url.register('wss:', ws_listen, ws_connect);

function ws_listen (stream_url, callback) {
    var parsed = url.parse(stream_url);
    var wss = new WebSocket.Server({
        host: parsed.hostname || '127.0.0.1',
        port: parsed.port || 80,
        path: parsed.path || null
    }, callback);
    return wss;
}

WebSocket.prototype.write = function (data, callback) {
    this.send(data, callback);
};

WebSocket.prototype.end = function (data) {
    this.close(1000, data);
};

WebSocket.prototype._on = WebSocket.prototype.on;

WebSocket.prototype.on = function (event, callback) {
    switch (event) {
    case 'data':  this._on('message', callback); break;
    case 'end':   this._on('close', callback); break;
    default:      this._on(event, callback); break;
    }
};

function ws_connect (stream_url, callback) {
    var sock = new WebSocket(stream_url);
    if (callback) {
        sock.on('open', callback);
    }
    return sock;
}

module.exports = stream_url;
