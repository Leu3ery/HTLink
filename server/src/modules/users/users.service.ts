import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { LoginDTO } from "./users.dto";
import jwt from 'jsonwebtoken'
import { User } from "./users.model";
import { config } from "../../config/config";

class UsersService {
	static async isUserValid(dto: LoginDTO) {
		return true
	}

	static async login(dto: LoginDTO) {
		if (!await this.isUserValid(dto)) throw new ErrorWithStatus(400, "Login or password is false")
		const user = await User.findOne({ pc_number: dto.login })
		if (user) return jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '14d' })
		const newuser = new User()
		newuser.pc_number = dto.login
		await newuser.save()
		return jwt.sign({ userId: newuser._id }, config.JWT_SECRET, { expiresIn: '14d' })
	}
}

export default UsersService