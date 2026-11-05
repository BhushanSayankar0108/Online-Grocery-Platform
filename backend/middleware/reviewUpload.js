const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "reviews"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = allowedMimeTypes[file.mimetype];

    if (!extension) {
      return callback(new Error("Only JPEG, PNG, and WebP images are allowed."));
    }

    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes[file.mimetype]) {
    return callback(
      new Error("Only JPEG, PNG, and WebP images are allowed.")
    );
  }

  callback(null, true);
};

const reviewUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = reviewUpload;