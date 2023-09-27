// Modulos

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

// Initiaizations

const server = express();

// Settings

server.set('port',process.env.PORT || 3000);

// Middlewares

server.use(morgan('combined'));
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use(cors())

//  Routes
server.use('/authentication',require(path.join(__dirname, 'routes/authentication.js')))

// Global Varables
// Public Files


// Listening Server

server.listen(server.get('port'), () => {
    console.log("Server on port: ",server.get('port'));
});