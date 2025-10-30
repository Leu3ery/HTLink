import { Router } from "express";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import UsersController from "./users.controller";
import JWTMiddleware from "../../common/middlewares/JWTMiddleware";

const router = Router()

router.patch('/me', JWTMiddleware, ErrorWrapper(UsersController.updateMe))
router.get('/me', JWTMiddleware, ErrorWrapper(UsersController.getMe))
router.get('/:id', ErrorWrapper(UsersController.getUser))
router.get('/', ErrorWrapper(UsersController.getUsers))

export default router