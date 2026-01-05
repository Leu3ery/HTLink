import { NextFunction, Request, Response } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers";
import { LoginSchema } from "./auth.dto";
import AuthService from "./auth.service";

class AuthController {
	static async login(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper(LoginSchema, req.body || {})
		const token = await AuthService.login(dto)
		res.status(200).json({token: token})
	}
}

export default AuthController

