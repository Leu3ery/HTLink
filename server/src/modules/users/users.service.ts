import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { GetUsersDTO, LoginDTO, UpdateMeDTO } from "./users.dto";
import jwt from 'jsonwebtoken'
import { User } from "./users.model";
import { config } from "../../config/config";
import UserMapper from "./users.mappers";
import deleteFile from "../../common/utils/utils.deleteFile";
import { Skill } from "../skills/skills.model";

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

	static async updateMe(userId: string, dto: UpdateMeDTO) {
		const user = await User.findById(userId)
		if (!user) throw new ErrorWithStatus(404, "User not found")
		if (dto.skills) {
			const skills = await Skill.find({ _id: { $in: dto.skills } })
			if (skills.length !== dto.skills.length) throw new ErrorWithStatus(400, "One or more skill IDs are invalid")
		}
		if (dto.photo_path && user.photo_path) {
			await deleteFile(user.photo_path)
		}
		user.set(dto)
		await user.save()
		const updatedUser = await User.findById(userId).populate('skills');
		return UserMapper.toPublicUser(updatedUser!)
	}

	static async getUser(userId: string) {
		const user = await User.findById(userId).populate('skills');
		if (!user) throw new ErrorWithStatus(404, "User not found")
		return UserMapper.toPublicUser(user)
	}

	static async getUsers(dto: GetUsersDTO) {
		const query: any = {}
		if (dto.department) query.department = dto.department
		if (dto.class) query.class = dto.class
		if (dto.pc_id) query.pc_number = dto.pc_id
		
		// Build the search query for nameContains using $or to search in first_name or last_name
		if (dto.nameContains) {
			query.$or = [
				{ first_name: { $regex: dto.nameContains, $options: 'i' } },
				{ last_name: { $regex: dto.nameContains, $options: 'i' } }
			]
		}
		const users = await User.find(query).skip(dto.offset).limit(dto.limit).populate('skills')	
		return users.map(user => UserMapper.toPublicUser(user))
	}
}

export default UsersService