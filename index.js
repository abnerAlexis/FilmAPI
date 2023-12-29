const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path");

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//Cross-Origin-Resource-Sharing has to be placed before 'auth'
const cors = require('cors');
let allowedOrigins = [
        'http://localhost:8080', 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = "The CORS policy for this application does'nt allow access from origin " + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

//importing express-validator
const {check, validationResult} = require('express-validator');

let auth = require('./auth')(app);  //(app) argument allows Express to be available in auth.js
const passport = require('passport');
require('./passport');

//Require Mongoose package, "models.js" and Mongoose Models
const mongoose = require("mongoose");
const Models = require("./models");

//Connect Mongoose to
// mongoose
//   .connect("mongodb://localhost:27017/filmDB") //https://stackoverflow.com/questions/77415433/how-to-resolve-this-mongodb-warning-issue-in-node-js-and-how-to-traceback-about
//   .then(() => {
//     console.log("DB connection successful.");
//   })
//   .catch((err) => {
//     console.log(`DB connection error:${err}`);
//   });

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


//creating a write stream in append mode, and a txt file in root dir.
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

//setting up the logger
app.use(morgan('combined', { stream: accessLogStream }));

const Movies = Models.Movie;
const Users = Models.User;
const Actors = Models.Actor;

app.get("/", (req, res) => {
  res.send("Welcome to the movie app!");
});

// http://localhost:8080/movies displays the movies list in JSON format
app.get("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  
  await Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Add new movie
app.post("/movies", passport.authenticate('jwt', { session: false }), async (req, res) => {
  
  await Users.findOne({ Title: req.body.Title })
    .then((movie) => {
      if (movie) {
        return res.status(400).send(req.body.Title + "already exists");
      } else {
        Movies.create({
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
          Actors: [],
          Featured: req.body.Featured,
          ImageURL: req.body.ImageURL,
        })
          .then((movie) => {
            res.status(201).json(movie);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  
  await Movies.findOne({ Title: req.params.Title })
    .then(movie => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Add an actor to a movie's actors list
app.post('/movies/:Title/actors/:actorid', passport.authenticate('jwt', { session: false }), async (req, res) => {
   
  await Movies.findOneAndUpdate({ Title: req.params.Title }, {
    $push: { Actors: req.params.actorid }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedMovie) => {
      res.json(updatedMovie);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error' + error);
    });
});

//Get director (bio, birth year, death year) by title.
app.get('/movies/directorname/:Title', passport.authenticate('jwt', { session: false }), async(req, res) => {
  
  await Movies.findOne({ Title: req.params.Title }).select('Director')
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get genre by title
app.get('/movies/genre/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  
  await Movies.findOne({ Title: req.params.Title }).select('Genre')
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get actors list
app.get("/actors", passport.authenticate('jwt', { session: false }), async (req, res) => {

  await Actors.find()
    .then((actors) => {
      res.status(200).json(actors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Add New Actor to actors list
app.post('/actors', passport.authenticate('jwt', { session: false }), async (req, res) => {

  await Actors.findOne({ Name: req.body.Name })
    .then((actor) => {
      if (actor) {
        return res.status(400).send(req.body.Name + 'already exists');
      } else {
        Actors
          .create({
            Name: req.body.Name,
            Birth: req.body.Birth,
            Death: req.body.Death,
            Bio: req.body.Bio
          })
          .then((actor) => { res.status(201).json(actor) })
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

//Get users list ===> Only Admin should see this?
app.get("/users", passport.authenticate('jwt', { session: false }),  async(req, res) => {
  await Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Add New User to users list
app.post('/users', [
  check('Username', 'Username is required').isLength({min:5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid.').isEmail(),
], async (req, res) => {

  //Check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  
  //Checks whether a user with the same username exists.
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {

      //If a user with the same username found;
      if (user) {
        return res.status(400).send(req.body.Username + 'username already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Birthday: req.body.Birthday,
            Email: req.body.Email,
            FavoriteMovies: [req.params.movieid]
          })
          .then((user) => { res.status(201).json(user) })
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

// Get a user by username ======> Only Admin?
app.get('/users/:Username', passport.authenticate('jwt', { session: false }),  async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:movieid', passport.authenticate('jwt', { session: false }), async (req, res) => {

  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.movieid }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error' + error);
    });
});

// Remove a movie from a user's list of favorites
app.delete('/users/:Username/movies/:movieid', passport.authenticate('jwt', { session: false }), async (req, res) => {
  
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.movieid }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error' + error);
    });
});

//Update users password and email
app.put('/users/:Username', [
  check('Password', 'New password is required.').isLength({min: 5}),
  check('Email', 'Email does not appear to be valid').isEmail(),
], passport.authenticate('jwt', { session: false }), async (req, res) => {

  //checks the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  //CONDITION TO CHECK
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }  //CONDITION ENDS
  
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Password: req.body.Password,
      Email: req.body.Email
    }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(error);
      res.status(500).send('Error: ' + error)
    })
});

// Delete a user by userid
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {

  await Users.findOneAndDelete({ _id: req.params.id })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.id + ' was not found');
      } else {
        res.status(200).send(req.params.id + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// app.listen(8080, () => {
//   console.log("The app is listening on port 8080.");
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});