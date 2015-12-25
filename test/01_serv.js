"use strict";
var su = require('stream-url');
require('..');

var tape = require('tape');
if (typeof(window)==='object') {
    var tape_dom = require('tape-dom');
    tape_dom.installCSS();
    tape_dom.stream(tape);
}

tape ('1.A create echo server', function (t) {
    var port = Math.floor(Math.random()*10000) + 2000;
    var url = 'ws://localhost:'+port;
    console.log(url);
    t.plan(6);
    var wss = su.listen(url, function ready() {
        wss.on('connection', function (stream) {
            stream.on('data', function (data) {
                console.log('data', data);
                stream.write(data);
            });
            stream.on('end', function () {
                t.pass('server stream ends');
                wss.close();
                t.end();
            });
        });
        var ws = su.connect(url, function (err, sock) {
            t.notOk(err, 'No errors expected');
            t.equal(sock, ws, 'Callback parameter is the stream itself');

            // console.log('connected');
            ws.on('data', function (data) {
                t.equal(''+data, 'test');
                ws.end(); // TODO on(end)
            });
            ws.on('end', function () {
                t.pass('client stream ends');
            });
            ws.write('test', function () {
                t.pass('sent');
            });
        });
    });
});

tape ('1.B connection fail', function (t) {
    var url = 'ws://localhost:1';
    var ws = su.connect(url, function (err, socket) {
        t.equal(err.code, 'ECONNREFUSED', 'Connection refused');
        t.notOk(socket, 'Socket parameter should be null');
        t.end();
    });
});
