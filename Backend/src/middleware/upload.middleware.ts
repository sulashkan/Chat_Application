import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });


// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "chat-app",
//     allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "webm"],
//   },
// });

// export const upload = multer({ storage });