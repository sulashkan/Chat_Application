import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import auth from "../middleware/auth.middleware";

const router = Router();

router.post("/", auth, upload.single("file"), (req, res) => {
  const file = req.file;

  res.json({
    mediaUrl: `/uploads/${file?.filename}`,
  });
});


// router.post("/", auth, upload.single("file"), (req, res) => {
//   const file = req.file as any;

//   res.json({
//     mediaUrl: file.path, // THIS IS FULL CLOUDINARY URL
//   });
// });

export default router;