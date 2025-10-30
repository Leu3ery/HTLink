import { Router } from "express";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import UsersController from "./users.controller";
import JWTMiddleware from "../../common/middlewares/JWTMiddleware";
import { upload } from "../../common/multer/multer.photo";

const router = Router()

router.patch('/me', JWTMiddleware, upload.single('photo'), ErrorWrapper(UsersController.updateMe))
router.get('/me', JWTMiddleware, ErrorWrapper(UsersController.getMe))
router.get('/:id', ErrorWrapper(UsersController.getUser))
router.get('/', ErrorWrapper(UsersController.getUsers))

export default router