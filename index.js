const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));

    //Require Mongoose package, "models.js" and Mongoose Models
    const mongoose = require('mongoose');
    const Models = require('./models');

    //Connect Mongoose to myFlixDB
    mongoose.connect('mongodb://localhost:27017/filmDB', 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });         

    const Movies = Models.Movie;
    const Users = Models.User;
    const Actors = Models.Actor;

    app.get('/', (req, res) => {
        res.send('Welcome to the movie app!');
    });

    app.get('/movies', (req, res) => {
    res.send('Movies you will see!');
    });

    app.listen(8080, () => {
        console.log("The app is listening on port 8080.")
    })