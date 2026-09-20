const authServices = require('./../services/authServices');
const asyncHandler = require('./../utils/asyncHandler');
const ApiError = require('./../utils/ApiError');

const registerUserV = async(req, res) => {
    const { name, email, password } = req.body;
    const result = await authServices.registerUser({name, email, password});

    res.status(201).json({
        status:true,
        message:'user registered succefully',
        data: result,
    });
};

const loginUserV = async (req, res) => {
    const { email, password } = req.body;
    const result = await authServices.loginUser({ email, password });

    res.status(200).json({
        status: true,
        message: 'User logged in successfully',
        data: result
    });
};
const updateProfileV = async (req, res) => {
  const { name, bio } = req.body;
  const user = await authServices.updateProfileService(req.user.id, { name, bio });
  res.status(200).json({
    status: true,
    message: 'Profile updated successfully.',
    data: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl },
  });
};

const uploadAvatarV = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided.');
  }
  const user = await authServices.uploadAvatarService(req.user.id, req.file);
  res.status(200).json({
    status: true,
    message: 'Avatar uploaded successfully.',
    data: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl },
  });
};
//const registerUser = asyncHandler(registerUserV)
module.exports = {
 registerUser: asyncHandler(registerUserV),
 loginUser : asyncHandler(loginUserV),
 updateProfile : asyncHandler(updateProfileV),
 uploadAvatar : asyncHandler(uploadAvatarV)

};
