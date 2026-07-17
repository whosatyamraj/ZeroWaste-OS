import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { ApiError } from '../utils/apiError';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp', '.gif'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uuid = uuidv4();
    cb(null, `${uuid}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(ApiError.badRequest(`File type '${file.mimetype}' is not allowed. Allowed types: JPEG, PNG, WebP, GIF`));
    return;
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(ApiError.badRequest(`File extension '${ext}' is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`));
    return;
  }

  cb(null, true);
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single('image');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
}).array('images', 5);

export default multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// Alias for controllers
export const uploadImages = uploadMultiple;
