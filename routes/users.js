const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require("passport");

// users/login 
router.get("/login", (req, res) => {
    res.render("login");
});


// >>>>>>> register page
// get
router.get("/register", (req, res) => {
    res.render("register");
});


// post
router.post("/register", (req, res) => {
    // 1. field specified in ejs
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // 2. check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "please fill in all fields" });
    }

    // 3. check password match
    if (password !== password2) {
        errors.push({ msg: "Password do not match" });
    }

    // 4. if there is error, display
    if (errors.length > 0) {
        res.render("register", {
            // pass error message and redisplay values
            errors,
            name,
            email,
            password,
            password2

        });
        // 5. no error
    } else {

        // 6. check if user already exists
        // this findOne will return a promise
        User.findOne({ email: email }).then(foundUser => {

            // user already exists
            if (foundUser) {

                errors.push({ msg: "email is already registered" })
                res.render("register", {
                    // pass error message and the values
                    // we want the values to stay in html
                    errors,
                    name,
                    email,
                    password,
                    password2

                });
                // 7. user haven't exist
            } else {
                const newUser = new User({
                    username: name,
                    email: email,
                    password: password
                });


                // >> This flash doesnt work I want to prepopulate email and password
                // newUser.save()
                //     .then(user => {
                //         req.flash("success_msg", "You are now registered and can log in");
                //         res.render("login", {
                //             email: user.email,
                //             password: password
                //         });
                //     })
                //     .catch(err => console.log(err));

                // >> this flash works hash the password
                newUser.save()
                    .then(user => {
                        req.flash("success_msg", "You are now registered and can log in");
                        res.redirect("/users/login");
                    })
                    .catch(err => console.log(err));
                console.log(">>>> new user: " + newUser);
            }
        });
    }
});


// process the login forms
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/dashboard', // redirect to the secure profile section
    failureRedirect: '/users/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

module.exports = router;