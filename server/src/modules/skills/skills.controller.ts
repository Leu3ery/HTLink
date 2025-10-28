import { NextFunction, Request, Response } from "express";
import SkillService from "./skills.service";

class SkillController {
	static async getSkills(req: Request, res: Response, next: NextFunction) {
		const skills = await SkillService.getSkills()
		res.json(skills).status(200)
	}
}

export default SkillController