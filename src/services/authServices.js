const fs = require('fs/promises');
const path = require('path');
const User = require('./../models/User');
//const Note = require('./../models/Note');
const generateToken = require('./../utils/generateToken');
const ApiError = require('./../utils/ApiError');
const logger = require('./../config/logger');

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
const AVATAR_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");
const updateProfileService = async (userId, {name, bio}) => {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

 const user = await User.findByIdAndUpdate(
    userId,
    updates,
    {new: true, runValidators: true});

    if (!user) {
        throw new ApiError(404, "user not found");
     };
    return user;
    };

const uploadAvatarService = async (userId, file)=>{
    const user = await User.findById(userId);
    if (!user) {
        throw new Error(404, 'u/user not found')
    };

    await fs.mkdir(AVATAR_DIR, {recursive:true});

    const extension = path.extname(file.originalname) || '.jpeg';
    const fileName = `${userId}-${Date.now()}${extension}`;
    const filePath = path.join(AVATAR_DIR, fileName);

    await fs.writeFile(filePath, file.buffer);

    if (user.avatarUrl) {
        const oldFileName = path.basename(user.avatarUrl);
        const oldFilePath = path.join(AVATAR_DIR, oldFileName);

        try {
            await fs.unlink(oldFilePath)
        }catch(err){
            logger.warn(`your old Image/avatar wasn't deleted at ${oldFilePath}-{err.message}`)
        }
    }
    user.avatarUrl = `/uploads/${fileName}`
    await user.save()

    return user;
 }
 module.exports = {
    registerUser,
    loginUser,
    updateProfileService,
    uploadAvatarService
 };
