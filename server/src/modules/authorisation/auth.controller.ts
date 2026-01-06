import { NextFunction, Request, Response } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers";
import { LoginSchema, SendCodeSchema, VerifyCodeSchema } from "./auth.dto";
import AuthService from "./auth.service";

class AuthController {
	static async sendCode(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper(SendCodeSchema, req.body || {})
		await AuthService.sendCode(dto)
		res.status(200).send()
	}

	static async verifyCodeByEmail(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper(VerifyCodeSchema, req.body || {})
		const token = await AuthService.verifyCodeByEmail(dto)
		res.status(200).json({token: token})
	}
	
	static async login(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper(LoginSchema, req.body || {})
		const token = await AuthService.login(dto)
		res.status(200).json({token: token})
	}
}

export default AuthController

