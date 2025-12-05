import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../lib/middleware/auth.middleware';
import {
  uploadDocumentController,
  listDocumentsController,
  getDocumentController,
  deleteDocumentController,
  queryDocumentController,
  summarizeDocumentController,
  compareDocumentsController,
  extractDocumentTextController,
} from '../controllers/documents.controller';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Upload a document
router.post('/upload', upload.single('file'), uploadDocumentController);

// List user's documents
router.get('/', listDocumentsController);

// Get a specific document
router.get('/:id', getDocumentController);

// Delete a document
router.delete('/:id', deleteDocumentController);

// Query a document
router.post('/:id/query', queryDocumentController);

// Summarize a document
router.post('/:id/summarize', summarizeDocumentController);

// Compare documents
router.post('/compare', compareDocumentsController);

// Extract text from a document
router.post('/:id/extract', extractDocumentTextController);

export default router;
