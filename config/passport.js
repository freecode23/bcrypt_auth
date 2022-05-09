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

    // 2. >>>>>>>>>>>>>>>>>>>>>>>>> register strategy
    passport.use("local-register",
        new LocalStrategy({
                usernameField: 'email',
                passReqToCallback: true
            },

            // - callback: what happen during register 
            function(req, email, password, done) {

                User.findOne({ email: email }, function(err, foundUser) {

                    // 1. validate input  
                    if (!req.body.name || !req.body.password2 || !email || !password) {
                        return done(err, false, req.flash("error_msg", "Please fill in all fields"));

                    } else if (password != req.body.password2) {
                        return done(err, false, req.flash("error_msg", "password does not match"));
                    }

                    if (err) { // 2. other error
                        return done(err);
                    }

                    if (foundUser) { // 3. user already exists
                        // @ts-ignore
                        return done(null, false, req.flash("error_msg", "User already exists"));

                    } else { // 4. create new user

                        const newUser = new User({
                            username: req.body.name,
                            email: email,
                            password: password
                        });

                        newUser.save()
                            .then(user => {
                                // @ts-ignore
                                return done(null, newUser, req.flash("success_msg", "You are now registered and can log in"))
                            })
                            .catch(err => console.log(err));
                    }
                })

            })
    ); // end of register

    // 3.  >>>>>>>>>>>>>>>>>>>>>>>>> login strategy
    passport.use("local-login",
        new LocalStrategy({
                usernameField: 'email',
                passReqToCallback: true
            },

            // - callback: what happen during login  
            function(req, email, password, done) {
                // Match user
                User.findOne({ email: email }, function(err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (!user) {
                        // @ts-ignore
                        return done(null, false, req.flash("error_msg", "User does not exists"));
                    }

                    // match password input and user's actual password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            // @ts-ignore
                            return done(null, false, req.flash('error_msg', 'pasword incorrect'));
                        }
                    });
                })

            })
    ); // end of log in



};