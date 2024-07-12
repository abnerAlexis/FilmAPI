require("dotenv").config();
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

/**
 * List of allowed origins for CORS.
 * @type {string[]}
 */
const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://film-flix-aa36.netlify.app",
  "https://abneralexis.github.io"
];

/**
 * Middleware to configure CORS.
 * 
 * This middleware checks the origin of the incoming request. If the origin is not 
 * in the allowedOrigins list, it returns an error. Otherwise, it allows the request.
 *
 * @function
 * @param {Object} req - The request object.
 * @param {Function} callback - The callback to handle the response.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

//importing express-validator
const { check, validationResult } = require("express-validator");

/**
 * Initialize authentication module.
 * 
 * @param {Object} app - The Express application object.
 */
let auth = require("./auth")(app); //(app) argument allows Express to be available in auth.js
const passport = require("passport");
require("./passport");

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


/**
 * Connect to the MongoDB database using the connection URI from environment variables.
 * Logs a message indicating whether the connection was successful or if there was an error.
 * 
 * @returns {Promise} The promise for the database connection.
 */
mongoose.connect(process.env.CONNECTION_URI)
  .then(() => {
    console.log("DB connection is successful.");
  })
  .catch(err => {
    console.log(`DB conndection error: ${err}`);
  })

/**
 * Create a write stream in append mode.
 * This write stream logs data to a file named 'log.txt' in the root directory.
 * 
 * @type {fs.WriteStream}
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

/**
 * Middleware to log HTTP requests.
 * 
 * @param {string} format - The format of the logs.
 * @param {Object} options - Options for the logger, including the write stream.
 */
app.use(morgan("combined", { stream: accessLogStream }));

const Movies = Models.Movie;
const Users = Models.User;
const Actors = Models.Actor;

app.get("/", (req, res) => {
  res.send("Welcome to the movie app!");
});

/**
 * http://localhost:8080/movies displays the movies list in JSON format
 */
app.get(
  "/movies",
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then(movies => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Route to create a new movie.
 * 
 * @name post/movies
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * 
 */
app.post(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

/**
 * Route to get a movie by title.
 * 
 * @name get/movies/:Title
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters from the URL.
 * @param {string} req.params.Title - The title of the movie to retrieve.
 * @param {Object} res - The response object.
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Add an actor to a movie's actors list
 */
app.post(
  "/movies/:Title/actors/:actorid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOneAndUpdate(
      { Title: req.params.Title },
      {
        $push: { Actors: req.params.actorid },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedMovie) => {
        res.json(updatedMovie);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error" + error);
      });
  }
);

/**
 * Route to get the director of a movie by title.
 * 
 * @name get/movies/director/:Title
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters from the URL.
 * @param {string} req.params.Title - The title of the movie to retrieve the director for.
 * @param {Object} res - The response object.
 */
app.get(
  "/movies/director/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .select("Director")
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Route to get the genre of a movie by title.
 * 
 * @name get/movies/genre/:Title
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters from the URL.
 * @param {string} req.params.Title - The title of the movie to retrieve the genre for.
 * @param {Object} res - The response object.
 */
app.get(
  "/movies/genre/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .select("Genre")
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get actors list
 */
app.get(
  "/actors",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Actors.find()
      .then((actors) => {
        res.status(200).json(actors);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Add New Actor to actors list
 */
app.post(
  "/actors",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Actors.findOne({ Name: req.body.Name })
      .then((actor) => {
        if (actor) {
          return res.status(400).send(req.body.Name + "already exists");
        } else {
          Actors.create({
            Name: req.body.Name,
            Birth: req.body.Birth,
            Death: req.body.Death,
            Bio: req.body.Bio,
          })
            .then((actor) => {
              res.status(201).json(actor);
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
  }
);

/**
 * Get users list ===> Only Admin should see this?
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Route to create a new user.
 * 
 * @name post/users
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing user details.
 * @param {string} req.body.Username - The username for the new user.
 * @param {string} req.body.Password - The password for the new user.
 * @param {string} req.body.Email - The email for the new user.
 * @param {string} [req.body.Birthday] - The birthday for the new user.
 * @param {Object} res - The response object.
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 3 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail(),
  ],
  async (req, res) => {
    //Check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    //Checks whether a user with the same username exists.
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        //If a user with the same username found;
        if (user) {
          return res
            .status(400)
            .send(req.body.Username + "username already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Birthday: req.body.Birthday,
            Email: req.body.Email,
          })
            .then((user) => {
              res.status(201).json(user);
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
  }
);

/**
 * Get a user by username ======> Only Admin?
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Route to add a movie to a user's list of favorite movies.
 * 
 * @name post/users/:Username/movies/:movieid
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.movieid - The ID of the movie to be added to favorites.
 * @param {Object} res - The response object.
 */
app.post(
  "/users/:Username/movies/:movieid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.movieid },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error" + error);
      });
  }
);

/**
 * Route to delete a movie by its title.
 * 
 * @name delete/movies/:Title
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {string} req.params.Title - The title of the movie to be deleted.
 * @param {Object} res - The response object.
 */
app.delete(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOneAndDelete({ Title: req.params.Title })
      .then((movie) => {
        if (movie) {
          res.status(200).send(req.params.Title + " was deleted.");
        } else {
          res.status(404).send(req.params.Title + " was not found");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Route to remove a movie from a user's list of favorite movies.
 * 
 * @name delete/users/:Username/movies/:movieid
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.movieid - The ID of the movie to be removed from the user's favorites.
 * @param {Object} res - The response object.
 */
app.delete(
  "/users/:Username/movies/:movieid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.movieid },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error" + error);
      });
  }
);

/**
 * Update movie ImageURL==For Admin Use
 */
app.put("/movies/image/:title", async (req, res) => {
  console.log("Title: " + req.params.title);
  await Movies.findOneAndUpdate(
    { Title: req.params.title },
    {
      $set: {
        ImageURL: req.body.ImageURL,
      },
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .then((movie) => {
      if (!movie) {
        res.status(400).send(req.params.title + " was not found");
      } else {
        res.status(200).send(req.params.title + " is updated.");
      }
    })
    .catch((err) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

/**
 * Route to update a user's information.
 * 
 * @name put/users/update/:Username
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The current username of the user.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.Username - The new username for the user.
 * @param {string} req.body.Password - The new password for the user.
 * @param {string} req.body.Email - The new email for the user.
 * @param {string} req.body.Birthday - The new birthday for the user.
 * @param {Object} res - The response object.
 */
app.put(
  "/users/update/:Username",
  [
    check("Username", "Username should be at least 5 characters.").isLength({ min: 3 }),
    check("Password", "Password should be at least 5 characters.").isLength({ min: 3 }),
    check("Email", "Email does not appear to be valid.").isEmail(),
    check("Birthday", "Birthday is not valid.").isDate()
  ],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    //checks the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //CONDITION TO CHECK
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    } //CONDITION ENDS

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: Users.hashPassword(req.body.Password),
          Email: req.body.Email,
          Birthday: req.body.Birthday
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Delete a user by userid
// app.delete(
//   "/users/:id",
//   passport.authenticate("jwt", { session: false }),
//   async (req, res) => {
//     await Users.findOneAndDelete({ _id: req.params.id })
//       .then((user) => {
//         if (!user) {
//           res.status(400).send(req.params.id + " was not found");
//         } else {
//           res.status(200).send(req.params.id + " was deleted.");
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error: " + err);
//       });
//   }
// );

/**
 * Route to delete a user by username.
 * 
 * @name delete/users/:Username
 * @function
 * @memberof module:express.Router
 * @inner
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user to be deleted.
 * @param {Object} res - The response object.
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send(req.params.Username + " is deleted.");
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// app.listen(8080, () => {
//   console.log("The app is listening on port 8080.");
// });

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
