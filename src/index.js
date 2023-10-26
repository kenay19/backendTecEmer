// Modulos

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
// Initiaizations

const server = express();
// Settings

server.set('port',process.env.PORT || 3000);
// Middlewares
server.use(morgan('combined'));
server.use(express.urlencoded({ extended: false }));
server.use(express.json({limit: '50mb'}));
server.use(cors())

//  Routes
server.use('/authentication',require(path.join(__dirname, 'routes/authentication.js')));
server.use('/medictools',require(path.join(__dirname, 'routes/medictools.js')))

// Global Varables
// Public Files
server.use(express.static(path.join(__dirname,'./public' )))

// Listening Server

server.listen(server.get('port'), () => {
    console.log("Server on port: ",server.get('port'));
});