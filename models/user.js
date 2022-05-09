const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "cannot add a user without username"],
        unique: true,
        dropDups: true
    },

    email: {
        type: String,
        required: [true, "cannot add a user without email"],
        unique: true,
        dropDups: true
    },

    password: {
        type: String,
        required: [true, "cannot add a user without password"],
        unique: true,
        dropDups: true
    },

    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("user", userSchema);

// configure passportlocal
module.exports = User;