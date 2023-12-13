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

    //Connect Mongoose to  
    mongoose.connect('mongodb://localhost:27017/filmDB') //https://stackoverflow.com/questions/77415433/how-to-resolve-this-mongodb-warning-issue-in-node-js-and-how-to-traceback-about
        .then(()=>{
            console.log("DB connection successful.");
        })
        .catch((err)=>{
            console.log(`DB connection error:${err}`);
        });
            

    const Movies = Models.Movie;
    const Users = Models.User;
    const Actors = Models.Actor;

    app.get('/', (req, res) => {
        res.send('Welcome to the movie app!');
    });

    //Get movies list
    app.get('/movies', (req, res) => {
    res.send('Movies you will see!');
    });

    //Add new movie
    app.post('/movies', async (req, res) => {
        await Users.findOne({ Title: req.body.Title })
          .then((movie) => {
            if (movie) {
              return res.status(400).send(req.body.Title + 'already exists');
            } else {
              Movies
                .create({
                  Title: req.body.Title,
                  Description: req.body.Description,
                  Year: req.body.Year,
                  Genre: req.body.Genre,
                  Director: [
                    req.body.Director.Name,
                    req.body.Director.Bio,
                    req.body.Director.Birth,
                    req.body.Director.Death,
                  ],
                  Actors: [

                  ],
                  Featured: req.body.Featured,
                  ImageURL: req.body.ImageURL
                })
                .then((user) =>{res.status(201).json(user) })
                .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
              })
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      });
      

    app.listen(8080, () => {
        console.log("The app is listening on port 8080.")
    })