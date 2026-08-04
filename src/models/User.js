const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true, 'Email is required'],
        trim:true,
        unique:true,
        lowercase:true,
        match:[/^\S+@\S+\.\S+$/, 'Please provide valid email...']
    },
    password:{
        type:String,
        required:[true, 'password is required'],
        minLength: [8, 'A minimum of 8 characters required.'],
        select: false,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    }
},
{
    timestamps: true,
});
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
 // next();
});
userSchema.methods.comparePassword = async function comparePassword(candidatePassword){
    return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model('User', userSchema);

module.exports = User;
