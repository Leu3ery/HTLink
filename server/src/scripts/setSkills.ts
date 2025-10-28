import { Skill } from "../modules/skills/skills.model"

class setSkills {
	static skills = ["Express Js", "Angular", "Python"]

	constructor(skills: string[] = []) {
		if (skills.length > 1) {
			setSkills.skills = skills
		}
	}

	async isAlreadySet() {
		const skillsCount = await Skill.countDocuments()
		return skillsCount == setSkills.skills.length
	}

	async set() {
		if (await this.isAlreadySet()) {
			console.log("Skills already set")
			return
		}
		await Skill.deleteMany({})
		await Skill.bulkWrite(setSkills.skills.map(skill => ({
			insertOne: {
				document: {
					name: skill
				}
			}
		})))
		console.log("Skills were set")
	}
}

export default setSkills