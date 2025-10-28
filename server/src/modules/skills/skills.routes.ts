import { Router } from "express";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import skillController from "./skills.controller";

const router = Router()

router.get('/', ErrorWrapper(skillController.getSkills))

export default router