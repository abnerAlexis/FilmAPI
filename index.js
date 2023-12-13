const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
    
    app.listen(8080, () => {
        console.log("The app is listening on port 8080.")
    })