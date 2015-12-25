"use strict";
var su = require('stream-url');
require('..');

var tape = require('tape');
if (typeof(window)==='object') {
    var tape_dom = require('tape-dom');
    tape_dom.installCSS();
    tape_dom.stream(tape);
}

tape ('2.A reconnect with limit number of attempts', function (t) {
    var url = 'ws://localhost:1';
    var options = {reconnect: {maxRetries: 3, minDelay: 50}};
    var client = su.connect(url, options, function (err, ws) {
        t.notOk(ws, 'No stream expected');
        t.ok(err, 'Expected connection failure');
        t.end();
    });
});

tape ('2.B reconnect', function (t) {
    var port = Math.floor(Math.random()*10000) + 2000;
    var url = 'ws://localhost:' + port;
    var options = {reconnect: {maxRetries: 2, minDelay: 100}};
    var client = su.connect(url, options, function (err, ws) {
        t.ok(ws, 'Expect established connection');
        t.notOk(err, 'No errors expected');
        client.disable();
        ws.end();
    });

    setTimeout(function () {
        var ws_server = su.listen(url, function ready (err, serv) {
            t.pass('Server is listening');
            serv.on('connection', function (ws) {
                t.pass('New incoming connection');
                ws.write('something');
                ws.on('close', function () {
                    t.pass('Connection closed');
                    ws_server.close();
                    t.end();
                });
            });
        });
    }, 50);
});

tape ('2.C reconnect after disconnect', function (t) {
    t.plan(7);

    var port = Math.floor(Math.random()*10000) + 2000;
    var url = 'ws://localhost:' + port;

    var ws_server = su.listen(url, function ready (err, serv) {
        t.pass('Server is listening');
        serv.on('connection', function (ws) {
            t.pass('New incoming connection');
            ws.end('something');
        });

        var fired = 0;
        var options = {reconnect: {maxRetries: 2, minDelay: 100}};
        var client = su.connect(url, options, function (err, ws) {
            fired += 1;
            t.ok(ws, 'Expect established connection');
            t.notOk(err, 'No errors expected');
            if (fired >= 2) {
                client.disable();
                setTimeout(function () {
                    ws_server.close();
                    t.end();
                }, 500);
            }
        });
    });
});
