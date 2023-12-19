const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

//LocalStrategy - Defining basic HTTP authentication for login requests
passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({Username: username })
            .then(user => {
                if(!user) {
                    console.log('Incorrect username');
                    return callback(null, false, {
                        message: 'Incorrect username or password.'
                    });
                }
                console.log('Finished.');
                return callback(null, user);
            })
            .catch(error => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
            })
        }
    )
);

//JWTStrategy - to authenticate users based on the JWT sent along with the HTTP request
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, 

async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
    .then(user => {
        return callback(null, user);
    })
    .catch(error => {
        return callback(error)
    });
}));