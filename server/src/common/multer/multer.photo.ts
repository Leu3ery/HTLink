// chat gpt
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import { Request } from 'express'
import { ErrorWithStatus } from '../middlewares/errorHandlerMiddleware'
import {publicDir} from '../../app'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, publicDir)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + ext)
  }
})


function imageFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new ErrorWithStatus(400, 'Only images are allowed'))
  }
  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 4 * 1024 * 1024 } 
})