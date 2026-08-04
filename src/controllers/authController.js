const authServices = require('./../services/authServices');
const asyncHandler = require('./../utils/asyncHandler');

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
        data: result,
    });
};

const registerUser = asyncHandler(registerUserV);
const loginUser = asyncHandler(loginUserV);

module.exports = {
    registerUser,
    loginUser,
};
