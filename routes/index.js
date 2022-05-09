const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("welcome"); // use welcome.ejs
});

module.exports = router;