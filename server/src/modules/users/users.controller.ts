import { NextFunction, Request, Response } from "express";
import { validationWrapper } from "../../common/utils/utils.wrappers";
import { GetUsersSchema, LoginSchema, UpdateMeSchema } from "./users.dto";
import UsersService from "./users.service";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import mongoose, { Types } from "mongoose";

class UsersController {
	static async login(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper(LoginSchema, req.body || {})
		const token = await UsersService.login(dto)
		res.status(200).json({token: token})
	}

	static async updateMe(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const body = req.file ? {...req.body, photo_path: req.file.filename} : (req.body || {})
		const dto = validationWrapper(UpdateMeSchema, body)
		const user = await UsersService.updateMe(userId, dto)
		res.status(200).json({user: user})
	}

	static async getMe(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const user = await UsersService.getUser(userId)
		res.status(200).json({user: user})
	}

	static async getUser(req: Request, res: Response, next: NextFunction) {
		const userId = req.params.id
		if (!userId) throw new ErrorWithStatus(400, "User ID is required")
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			throw new ErrorWithStatus(400, "Invalid user id");
		}
		const user = await UsersService.getUser(userId)
		res.status(200).json({user: user})
	}

	static async getUsers(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper(GetUsersSchema, req.query || {})
		const users = await UsersService.getUsers(dto)
		res.status(200).json({users: users})
	}
}

export default UsersController