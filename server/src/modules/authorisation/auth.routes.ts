import { Router } from "express";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import AuthController from "./auth.controller";

const router = Router()

router.post('/login', ErrorWrapper(AuthController.login))

export default router

