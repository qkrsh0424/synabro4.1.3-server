var http = require('http');
var port = process.env.port || 4000;
var app = require('./app');

var server = http.createServer(app);

server.listen(port,function(){
    console.log('server is running on port: '+port);
});