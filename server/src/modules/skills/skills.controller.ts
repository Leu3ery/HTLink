import { NextFunction, Request, Response } from "express";
import skillService from "./skills.service";

class skillController {
	static async getSkills(req: Request, res: Response, next: NextFunction) {
		const skills = await skillService.getSkills()
		res.json(skills).status(200)
	}
}

export default skillController