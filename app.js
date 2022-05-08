//jshint esversion:6
// --> 1 npm init -y
// --> 2 npm i express ejs body-parser mongoose
// --> 3  terminal: "brew services start mongodb-community@5.0"
// --> 4 in terminal: mongo

// 1. import
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");


const app = express();

// 2. set and use
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

// 3. db
// - create schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "cannot add a user without username"],
        unique: true,
        dropDups: true
    },

    password: {
        type: String,
        required: [true, "cannot add a user without password"]
    },
})


// encrypt password field
userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ['password']
});

// - create item class / model. This is a collection
const User = mongoose.model("user", userSchema);

// 4. router
app.get("/", function(reqFromClient, resToClient) {
    console.log("\n>>>>>>>>>>>>>>>> app.get/");
    resToClient.render("home");
});

app.get("/login", function(reqFromClient, resToClient) {
    console.log("\n>>>>>>>>>>>>>>>> app.get/login");
    resToClient.render("login");
});

app.get("/register", function(reqFromClient, resToClient) {
    console.log("\n>>>>>>>>>>>>>>>> app.get/register");
    resToClient.render("register");


});


app.post("/register", function(reqFromClient, resToClient) {
    console.log("\n>>>>>>>>>>>>>>>> app.post/register");

    // create new object
    console.log(reqFromClient.body.username);
    console.log(reqFromClient.body.password);
    const newUser = new User({
        username: reqFromClient.body.username, // from the name field of the input element
        password: reqFromClient.body.password
    });


    // if registered, just show the secrets
    // there is no get /secrets
    newUser.save(function(err) {
        if (err) {
            console.log(err.name);
            if (err.name === 'MongoServerError' && err.code === 11000) {
                // Duplicate username
                console.log("user already exists");
                resToClient.redirect('/register');
            } else {
                console.log("some other error");
                resToClient.redirect('/register');
            }

        } else {
            resToClient.render("secrets");
        }
    });
});


app.post("/login", function(reqFromClient, resToClient) {
    console.log("\n>>>>>>>>>>>>>>>> app.post/register");

    // 1. create new object
    const usernameInput = reqFromClient.body.username; // from the name field of the input element
    const passwordInput = reqFromClient.body.password;

    // 2. check if exists in database, if it does show secret
    User.findOne({
            username: usernameInput
        },
        function(err, foundUser) {
            // - inside this block, the password is decrypted


            if (err) {
                console.log(err);
                resToClient.redirect('/register');
            } else {
                if (foundUser) {
                    console.log("found pass: " + foundUser.password);
                    // - if same password
                    if (foundUser.password === passwordInput) {

                        resToClient.render("secrets");
                    } else {
                        console.log("wrong password");
                        resToClient.redirect("/register");
                    }

                } else {
                    console.log("user not found");
                    resToClient.redirect("/register");
                }

            }
        });
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
});