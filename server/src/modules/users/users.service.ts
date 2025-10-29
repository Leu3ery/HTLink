import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { GetUsersDTO, LoginDTO, UpdateMeDTO } from "./users.dto";
import jwt from 'jsonwebtoken'
import { IUser, User } from "./users.model";
import { config } from "../../config/config";

class UsersService {
	static toPublicUser(user: IUser) {
		return {
			id: user._id.toString(),
			first_name: user.first_name ?? null,
			last_name: user.last_name ?? null,
			description: user.description ?? null,
			department: user.department ?? null,
			class: user.class ?? null,
			photo_path: user.photo_path ?? null,
			role: user.role ?? null,
			github_link: user.github_link ?? null,
			linkedin_link: user.linkedin_link ?? null,
			banner_link: user.banner_link ?? null,
			created_at: user.created_at,
			pc_number: user.pc_number,
		}
	}

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
		user.set(dto)
		await user.save()
		return this.toPublicUser(user)
	}

	static async getUser(userId: string) {
		const user = await User.findById(userId)
		if (!user) throw new ErrorWithStatus(404, "User not found")
		return this.toPublicUser(user)
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
		const users = await User.find(query).skip(dto.offset).limit(dto.limit)	
		return users.map(user => this.toPublicUser(user))
	}
}

export default UsersService