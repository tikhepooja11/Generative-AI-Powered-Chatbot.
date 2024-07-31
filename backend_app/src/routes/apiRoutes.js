import express from "express";
import {
  handleQuery,
  handlePractice,
  handleExplain,
  provideImageContext,
  provideDocumentSummary,
} from "../controllers/controller.js"; // Ensure correct path and extension
import multer from "multer";
import path from "path";

const router = express.Router();
// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
// Setup multer for file upload
// const upload = multer({ dest: "uploads/" });

router.post("/query", handleQuery);
router.post("/practice", handlePractice);
router.post("/explain", handleExplain);
router.post("/image", upload.single("image"), provideImageContext);
router.post("/document", upload.single("file"), provideDocumentSummary);

export default router;
