const {
    registerUser, loginUser
} = require('./../controllers/authController');

const validate = require('./../middlewares/validate');
const { registerSchema, loginSchema } = require('./../validations/authValidations');
const express = require('express');
const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

module.exports = router;
