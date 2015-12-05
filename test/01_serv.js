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
    t.plan(4);
    var wss = su.listen(url, function ready() {
        wss.on('stream', function (stream) {
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
        var ws = su.connect(url, function () {
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
