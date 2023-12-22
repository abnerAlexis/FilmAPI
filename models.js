const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    Title: {
        type: String,
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
        Birth: {
            type: Date,
        },
        Death: {
            type: Date,
        },
    },
    Featured: Boolean,
    Actors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actor',
    }],
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
    Birthday: Date,
    Email: {
        type: String,
        required: true,
    },
    FavoriteMovies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
    }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

let actorSchema = mongoose.Schema({
    Name: String,
    Birth: {
        type: Date,
    },
    Death: {
        type: Date,
    },
    Bio: String,
})

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Actor = mongoose.model('Actor', actorSchema);

module.exports = {
    Movie,
    User,
    Actor
}