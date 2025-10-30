import { IUser } from "./users.model";

class UserMapper {
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
}

export default UserMapper