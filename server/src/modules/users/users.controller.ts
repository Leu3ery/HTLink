import { NextFunction, Request, Response } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers";
import { LoginSchema } from "./users.dto";
import UsersService from "./users.service";

class UsersController {
	static async login(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper(LoginSchema, req.body || {})
		const token = await UsersService.login(dto)
		res.json({token: token}).status(200)
	}
}

export default UsersController