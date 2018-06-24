const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt  = require('bcrypt-nodejs');
var Poll = require('./poll');
//define our model
const userSchema = new Schema({
   email: { type: String, unique: true, lowercase: true },
   password: String,
   polls: [{
       type: Schema.Types.ObjectId,
       ref: 'Poll'
   }]
});


//on save hook, encrypt password
//before saving a model, run this function
userSchema.pre('save', function(next) {
    //get access to user model
    const user = this;
    if(!user.isModified('password')){
        return next();
    } // if statement allows us to save user without modifying password hash
    //generate a salt then run callback
    //generate a salt then run callback
    bcrypt.genSalt(10, function(err, salt) {
        if(err) {
            return next(err);
        }
    //hash (encrypt) our password using the salt    
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if(err) {
                return next(err);
            }
            //overwrite plain text password with encrypted password
            user.password = hash;
            next();
        });
    });
});
userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) {
            return callback(err);
        }
        callback(null, isMatch);
    })
}

userSchema.pre('remove', function(next) {
    const Poll = mongoose.model('poll');
    Poll.remove({_id: {$in: this.polls}})
    .then(() => next());
})
//create the model class
const ModelClass = mongoose.model('User', userSchema);

//export the model
module.exports = ModelClass;