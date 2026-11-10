const protect = require("./../middlewares/authMiddleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  uploadAvatar,
  refresh,
  logout,
  logoutAll,

} = require("./../controllers/authController");

const validate = require("./../middlewares/validate");
const { avatarUpload } = require("./../middlewares/uploadMiddleware");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("./../validations/authValidations");
//import for the redis details
const {
  authLimiter,
  refreshLimiter,
} = require("./../middlewares/rateLimiters");

//midelewares...

const express = require("express");
const router = express.Router();

//end-points...
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout",  logout);
router.post("/logoutAll", protect, logoutAll);
router.patch("/me", protect, validate(updateProfileSchema), updateProfile);
router.post("/me/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);

module.exports = router;
