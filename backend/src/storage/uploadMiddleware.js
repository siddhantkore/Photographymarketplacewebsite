import multer from 'multer';
import path from 'path';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp', '.pdf', '.zip']);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
]);

function isAllowedFile(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension) && ALLOWED_MIME_TYPES.has(file.mimetype);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (isAllowedFile(file)) {
      cb(null, true);
      return;
    }

    cb(new Error('Invalid file type. Only images, PDFs, and ZIPs are allowed.'));
  },
});

export default upload;

