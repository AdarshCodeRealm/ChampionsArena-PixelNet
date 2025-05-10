import { Router } from "express";
import { 
  getAllTournaments, 
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getOrganizerTournaments
} from "../controllers/Tournament.controller.js";
import { authMiddleware, organizerAuthMiddleware } from '../middlewares/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Set up multer for file uploads
const createUploadDirectory = () => {
  const dir = path.join(process.cwd(), 'public/uploads/tournaments');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = createUploadDirectory();
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function(req, file, cb) {
    // Check file types
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images Only! (jpeg, jpg, png, gif)'));
    }
  }
});

// Public routes
router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);

// Protected routes
router.get("/organizer/tournaments", organizerAuthMiddleware, getOrganizerTournaments);

// Create tournament (requires organizer approval)
router.post(
  "/", 
  organizerAuthMiddleware, 
  upload.single('bannerImage'),
  createTournament
);

// Update tournament (requires tournament ownership)
router.put(
  "/:id", 
  organizerAuthMiddleware, 
  upload.single('bannerImage'),
  updateTournament
);

// Delete tournament (requires tournament ownership)
router.delete(
  "/:id", 
  organizerAuthMiddleware, 
  deleteTournament
);

export default router;
