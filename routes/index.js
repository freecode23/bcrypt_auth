const express = require("express");
const router = express.Router();

// below is equivalent to:
// ensureAuthenticated = require("../config/auth").ensureAuthenticated;
const { ensureAuthenticated } = require("../config/auth");


router.get("/", (req, res) => {
    res.render("welcome"); // use welcome.ejs
});

router.get("/dashboard", ensureAuthenticated, (req, res) =>
    res.render("dashboard", {
        name: req.user.username
    }));


module.exports = router;