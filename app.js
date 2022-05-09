//jshint esversion:6
// --> 1 npm init -y
// --> 2 npm i express ejs mongoose passport passport-local bcrypt connec-flash express-ejs-layouts
// --> 3 terminal: "brew services start mongodb-community@5.0"
// --> 4 in terminal: mongo

// 1. import
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");


app.set('view engine', 'ejs');

// 2. config
// - passport config
require("./config/passport")(passport);


// - db config
const dbPath = require("./config/keys").MongoURI;

mongoose
    .connect(dbPath, { useNewUrlParser: true })
    .then(console.log("mongoodb connected"))
    .catch(err => console.log(err));

// 3. EJS
app.use(expressLayouts);

// 4. body parser
app.use(express.urlencoded({
    extended: false
}));

// 5. Session
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));;
// 6. passport middleware
app.use(passport.initialize());
app.use(passport.session());

// 7. Set flash message
// connect flash middle ware
app.use(flash());

// own middleware to set global variable as flash message
app.use((req, res, next) => {
    // this global variable can be accessed in ejs
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// 8. Routes
// All the endpoints which are in index file are starting with /
app.use("/", require("./routes/index"));

// All the endpoints which are in index file are starting with /users
app.use("/users", require("./routes/users"));

app.listen(3000, function() {
    console.log("Server started on port 3000");
});