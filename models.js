const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: {type: String, 
            required: true,
    },
    Description: {
        type: String,
    },
    Year: {
        type: Number,
    },
    Genre: {
        Name: String,
        Description: String,
    },
    Director: {
        Name: String,
        Bio: String,
        Born: {
            type: Date,
        },
        Died: {
            type: Date,
        },
    },
    Featured: Boolean,
    Actors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Star',
    }],
    ImagePath: String,
    Featured: Boolean,
    ImageURL: String,
});

let userSchema = mongoose.Schema({
    Username: {
        type: String,
        required: true,
    },
    Password: {
        type: String,
        required: true,
    }, 
    Email: {
        type: String,
        required: true,
    },
    Birthdate: Date,
    FavoriteMovies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
    }]
});

let actorSchema = mongoose.Schema({
    Name: String,
    Birthday: {
        type: Date,
    },
    Death: {
        type: Date,
    },
    Biography: String,
})

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Actor = mongoose.model('Star', actorSchema);

module.exports = {
    Movie, 
    User,
    Actor
}