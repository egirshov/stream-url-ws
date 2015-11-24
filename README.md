# WebSocket adapter for stream-url

[stream-url](https://github.com/gritzko/stream-url) marries streams and urls. API user can start a server or a client connection using an ultra-compact universal interface of two methods: `listen` and `connect`. Underlying implementation relies on [websocket-stream](https://github.com/maxogden/websocket-stream) 

    // Server

    var su = require('stream-url-ws');

    // start a WebSocket echo server
    var server = su.listen ('ws://localhost:1234', function ready() {

        server.on('stream', function (stream) {

            stream.on('data', stream.write.bind(stream));

        })

    });


    // Client

    var su = require('stream-url-ws');

    var stream = su.connect('ws://localhost:1234', function ready() {

        stream.on ('data', function log (data) {
            console.log(''+data);
            stream.end();
        });

        stream.write('Hello world!');

    });

## API

Client handle is a duplex stream with additional `connect` event.
Server is a regular websocket server with additional `stream` event which carries stream-wrapped websocket (there is still `connection` event which carries
raw websocket object).
