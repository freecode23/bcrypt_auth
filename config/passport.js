const LocalStrategy = require("passport-local").Strategy;

// to check with database if it matches
const mongoose = require("mongoose");

// to decrypt the hash
const bcrypt = require("bcrypt");

// double dot to get outside of config
const User = require("../models/user");


module.exports = function(passport) {

    // 1. passport serialize and unserialize users out of session
    // instead of keeping the credentials in the browser
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // 2. login
    passport.use("local-login",
        new LocalStrategy({
                // - options
                usernameField: "email",
                passReqToCallback: true // do this so we can pass request
            },

            // - callback: what happen during login  
            function(req, email, password, done) {
                // Match user
                User.findOne({ email: email }, function(err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (!user) {
                        return done(null, false, req.flash("error_msg", "User does not exists"));
                    }

                    // match password input and user's actual password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, req.flash('error_msg', 'pasword incorrect'));
                        }
                    });
                })

            })
    ); // end of log in
};