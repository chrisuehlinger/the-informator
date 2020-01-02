const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const url = require('url');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const users = require('./routes/user');

const app = express();

const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


const privateKey  = fs.readFileSync('certs/key.pem', 'utf8');
const certificate = fs.readFileSync('certs/cert.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};
app.set('port', process.env.PORT || 443);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


const orbitalWS = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });

orbitalWS.on('connection', function connection(ws) {
  console.log('ORBITAL CONNECTED');
});

wss2.on('connection', function connection(ws) {
  // ...
});

function wsUpgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/orbital') {
    orbitalWS.handleUpgrade(request, socket, head, function done(ws) {
      orbitalWS.emit('connection', ws, request);
    });
  } else if (pathname === '/bar') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
}


httpServer.on('upgrade', wsUpgrade);
httpsServer.on('upgrade', wsUpgrade);

httpServer.listen(8080);
httpsServer.listen(8443);

module.exports = app;
