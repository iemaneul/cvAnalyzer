import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'application/pdf' || !file.originalname.toLowerCase().endsWith('.pdf')) {
      callback(new AppError(400, 'The selected file must be a PDF.'));
      return;
    }
    callback(null, true);
  },
});

