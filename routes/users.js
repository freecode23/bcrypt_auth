const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

// log in page
// users/login 
router.get("/login", (req, res) => {
    res.render("login");
});

// user model
// get out of the route folder
const User = require('../models/user');

// >>>>>>> register page
// get
router.get("/register", (req, res) => {
    res.render("register");
});


// post
router.post("/register", (req, res) => {
    // 1. field specified in ejs
    const { name, email, password, password2 } = req.body;
    console.log(name);
    console.log(email);
    console.log(password);
    console.log(password2);
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
            // pass error message and the values
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

                // hash the password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt,
                        (err, hashPassword) => {
                            if (err) throw err;

                            newUser.password = hashPassword;

                            // add user to database
                            newUser.save()
                                .then(user => {

                                    req.flash("success_msg", "You are now registered and can log in");

                                    // create flash message during a session
                                    res.redirect("/users/login");
                                })
                                .catch(err => console.log(err));
                        });
                });
                console.log(">>>> new user: " + newUser);
            }
        });
    }
});

module.exports = router;