import { Skill } from "../modules/skills/skills.model"

class SetSkills {
	static skills = [
		"Java",
		"JavaScript",
		"TypeScript",
		"HTML",
		"CSS",
		"PHP",
		"Ruby",
		"Swift",
		"Kotlin",
		"Go",
		"Rust",
		"C",
		"C++",
		"C#",
		"Python",
		"React",
		"Node.js",
		"MongoDB",
		"PostgreSQL",
		"MySQL",
		"Docker",
		"Kubernetes",
		"Git",
		"Express Js",
		"Angular",
		"Vue.js",
		"Next.js",
		"Flask",
		"Django",
		"FastAPI",
		"Flutter",
	]

	constructor(skills: string[] = []) {
		if (skills.length > 1) {
			SetSkills.skills = skills
		}
	}

	async isAlreadySet() {
		const skillsCount = await Skill.countDocuments()
		return skillsCount == SetSkills.skills.length
	}

	async set() {
		if (await this.isAlreadySet()) {
			console.log("Skills already set")
			return
		}
		await Skill.deleteMany({})
		await Skill.bulkWrite(SetSkills.skills.map(skill => ({
			insertOne: {
				document: {
					name: skill
				}
			}
		})))
		console.log("Skills were set")
	}
}

export default SetSkills