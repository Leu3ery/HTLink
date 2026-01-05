import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { GetUsersDTO, UpdateMeDTO } from "./users.dto";
import { User } from "./users.model";
import UserMapper from "./users.mappers";
import deleteFile from "../../common/utils/utils.deleteFile";
import { Skill } from "../skills/skills.model";

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
		if (dto.class) query.class = { $regex: '^' + dto.class, $options: 'i' }
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
