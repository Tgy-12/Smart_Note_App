const multer = require('multer');
const ApiError = require('./../utils/ApiError');

const ALLOWED_MIME_TYPES_FILES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_MIME_TYPES_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAX_FILE_SIZE_FILES = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_IMAGES = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();

 const uploadFile = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_FILES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES_FILES.includes(file.mimetype)) {
      return cb(new ApiError(400, `Invalid file type: ${file.mimetype}. Allowed: PDF, TXT, DOCX`), false);
    }
    cb(null, true);
  }

});

const avatarUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_IMAGES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES_IMAGES.includes(file.mimetype)) {
      return cb(new ApiError(400, `Invalid image type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF`), false);
    }
    cb(null, true);
  }
});

module.exports = {
  uploadFile,
  avatarUpload,
};
