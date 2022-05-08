const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 12;

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

// 4. bcrypt every user passwords
userSchema.pre("save", async function preSave(next) {
    const user = this; // this is the document to be saved

    // if password has not been hashed
    if (!user.isModified("password")) {
        return next();
    } else {
        // else its a plain text
        try {
            const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
            user.password = hash;
            return next();
        } catch (err) {
            return next(err);
        }
    }
});


// Create own compare password methods
userSchema.methods.comparePassword = function comparePassword(userInputpass, callback) {
    bcrypt.compare(userInputpass, this.password, function(error, isMatch) {
        if (error) {
            return callback(error);
        } else {
            callback(null, isMatch);
        }
    });
}
const User = mongoose.model("user", userSchema);
module.exports = User;