const protect  = require('./../middlewares/authMiddleware');
const
{registerUser, loginUser, updateProfile, uploadAvatar} =
 require('./../controllers/authController');

const validate = require('./../middlewares/validate');
const { avatarUpload} = require('./../middlewares/uploadMiddleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('./../validations/authValidations');

//midelewares...
const express = require('express');
const router = express.Router();

//end-points...
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

router.patch('/me', protect, validate(updateProfileSchema), updateProfile);
router.post('/me/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

module.exports = router;
