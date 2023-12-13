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

//Require Mongoose package, "models.js" and Mongoose Models
const mongoose = require("mongoose");
const Models = require("./models");

//Connect Mongoose to
mongoose
  .connect("mongodb://localhost:27017/filmDB") //https://stackoverflow.com/questions/77415433/how-to-resolve-this-mongodb-warning-issue-in-node-js-and-how-to-traceback-about
  .then(() => {
    console.log("DB connection successful.");
  })
  .catch((err) => {
    console.log(`DB connection error:${err}`);
  });

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
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Add new movie
app.post("/movies", async (req, res) => {
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

//Get genre by title
app.get('/movies/genre/:Title', async (req, res) => {
    await Movies.findOne({ Title: req.params.Title }).select('Genre')
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  //Get titles by the same genre
  

//Get actors list
app.get("/actors", (req, res) => {
    Actors.find()
    .then((actors) => {
      res.status(200).json(actors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Add New Actor to actors list
app.post('/actors', async (req, res) => {
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
            .then((actor) =>{res.status(201).json(actor) })
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

//Get users list
app.get("/users", (req, res) => {
    Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Add New User to users list
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Birthday: req.body.Birthday,
              Email: req.body.Email,
              FavoriteMovies: []
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

// Get a user by username
app.get('/users/:Username', async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

app.listen(8080, () => {
  console.log("The app is listening on port 8080.");
});
