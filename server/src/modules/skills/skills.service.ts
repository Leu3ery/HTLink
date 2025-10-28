import { Skill } from "./skills.model";

class SkillService {
	static async getSkills() {
		const skills = await Skill.find()
		return skills.map(skill => ({
			id: skill._id.toString(),
			name: skill.name
		}))
	}
}

export default SkillService