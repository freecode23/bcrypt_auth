const mongoose = require('mongoose');
var bcrypt = require('bcrypt');

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


// generating a hash before save
userSchema.pre("save", async function preSave(next) {
    const user = this; // this is the document/ user to be saved

    // if password has not been hashed
    if (!user.isModified("password")) {
        return next();
    } else {
        // else its a plain text
        try {
            const hash = await bcrypt.hash(user.password, 12);
            user.password = hash;
            return next();
        } catch (err) {
            return next(err);
        }
    }
});


// checks if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


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

// configure passportlocal
module.exports = User;