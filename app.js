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

const User = require("./models/user.js"); // password
// const bcrypt = require("bcrypt");
// const SALT_ROUNDS = 12;

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
// const userSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         required: [true, "cannot add a user without username"],
//         unique: true,
//         dropDups: true
//     },

//     password: {
//         type: String,
//         required: [true, "cannot add a user without password"]
//     },
// })

// // 4. bcrypt every user passwords
// userSchema.pre("save", async function preSave(next) {
//     const user = this; // this is the document to be saved

//     // if password has not been hashed
//     if (!user.isModified("password")) {
//         return next();
//     } else {
//         // else its a plain text
//         try {
//             const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
//             user.password = hash;
//             return next();
//         } catch (err) {
//             return next(err);
//         }
//     }
// });


// // Create own compare password methods
// userSchema.methods.comparePassword = function comparePassword(userInputpass, callback) {
//     bcrypt.compare(userInputpass, this.password, function(error, isMatch) {
//         if (error) {
//             return callback(error);
//         } else {
//             callback(null, isMatch);
//         }
//     });
// }
// const User = mongoose.model("user", userSchema);
// module.exports = User;



// 5. router
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
    console.log("\n>>>>>>>>>>>>>>>> app.post/login");

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
                resToClient.redirect('/login');
            } else {
                if (foundUser) {
                    // - if same password
                    foundUser.comparePassword(passwordInput, function(matchError, isMatch) {
                        if (matchError) {
                            console.log("match error");
                        } else if (!isMatch) {
                            console.log("password not match");
                            resToClient.render("login");
                        } else {
                            console.log("password match");
                            resToClient.render("secrets");
                        }
                    });
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