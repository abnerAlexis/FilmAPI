# <span style="color: green;">FilmAPI</span> 
Visit @ https://young-reef-75254-12f86fe282e8.herokuapp.com/

This server-side module drives a web application, granting users access to comprehensive details about different films, directors, and genres. Users have the capability to register, modify their personal information, remove their profiles, and curate lists containing their preferred movies.

## 🛠️ <span style="color: green;">Technology Used</span>
- **Node.js** - Server-side JavaScript runtime designed for scalability.
- **Express.js** - Web framework for Node.js, streamlining web app development.
- **MongoDB** - Object modeling tool.
- **Mongoose** : Node library for interfacing with MongoDB databases.
- **JWT (JSON Web Token)** : For secure transmitting information between parties.
- **Postman** : To test the API.
- **Heroku** : Cloud platform for deploying and managing the application.

## ⚙️ <span style="color: green;">Endpoints</span>

- `/` - Navigates to the 'Welcome Page'. 
- `/movies` - Returns all listed movies using HTTP call method `GET`.
- `/movies` - Adds a new movie using HTTP call method `POST`.
- `/movies/:Title` - Returns data about a movie by title.
- `/movies/:Title/actors/:actorid` - Adds an actor to a movies actors list.
- `/movies/directorname/:Title` - Returns information about a director by the title of a movie.
- `/movies/genre/[Genre]` - Returns data about a genre by title.
- `/actors` - Returns the all actors listed.
- `/actors` - Adds new actor to the actors list via HTTP call method `POST`.
- `/users` - Returns the users list. This should be limited with admin password.
- `/users` - Adds a new users to the users list via HTTP `POST` method.
-`/users/:Username` - Gets data about a single user by username.
- `/users/:Username/movies/:movieid` - Allows users to add a movie to their list of favorites by movieID.
- `/users/:Username/movies/:movieid` - Removes a movie from the user's favorite movies list via HTTP call method `DELETE`.
- `/users/:Username` - Allows users to update their username and password.
- `/users/:id` - Deletes existing user's name.
- `/login` - Allows users to access to their profiles.