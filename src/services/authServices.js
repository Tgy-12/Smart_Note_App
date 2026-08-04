const User = require('./../models/User');
const generateToken = require('./../utils/generateToken');
const ApiError = require('./../utils/ApiError');

const registerUser = async ( {name, email, password}) => {

    const existingUser = await User.findOne({email});
    if (existingUser) {
        throw new ApiError (409, 'The User with this account already existed');
    };
    const user = await User.create({name, email, password});

    const token =  generateToken(user._id);

    return {
        user: { id: user._id, name: user.name, email: user.email},
        token
    };
};
 const loginUser = async ({email, password})=>{
    const user = await User.findOne({email}).select('+password');

    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    };

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    return {
        user:{id: user._id, name:user.name, email:user.email},
        token,
    };
 };

 module.exports = {
    registerUser,
    loginUser,
 }
