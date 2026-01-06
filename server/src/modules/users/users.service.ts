import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { GetUsersDTO, UpdateMeDTO } from "./users.dto";
import { User } from "./users.model";
import UserMapper from "./users.mappers";
import deleteFile from "../../common/utils/utils.deleteFile";
import { Skill } from "../skills/skills.model";
import bcrypt from 'bcrypt';
import { config } from "../../config/config";

class UsersService {
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
		if (dto.password) {
			user.password = await bcrypt.hash(dto.password, config.PASSWORD_SALT)
		}
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
		if (dto.class) {
			// Escape special regex characters to prevent regex injection
			const escapedClass = dto.class.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			query.class = { $regex: '^' + escapedClass, $options: 'i' }
		}
		
		// Build the search query for nameContains using $or to search in first_name or last_name
		if (dto.nameContains) {
			// Escape special regex characters to prevent regex injection
			const escapedName = dto.nameContains.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			query.$or = [
				{ first_name: { $regex: escapedName, $options: 'i' } },
				{ last_name: { $regex: escapedName, $options: 'i' } }
			]
		}
		const users = await User.find(query).skip(dto.offset).limit(dto.limit).populate('skills')	
		return users.map(user => UserMapper.toPublicUser(user))
	}
}

export default UsersService
