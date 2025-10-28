import { Router } from "express";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import UsersController from "./users.controller";

const router = Router()

router.post('/login', ErrorWrapper(UsersController.login))

export default router