import { validationWrapper } from "../../../common/utils/utils.wrappers";
import Joi from "joi";

export type CreateProjectDto = {
    title: string,
    categoryId: string,
    shortDescription: string,
    fullReadme: string,
    deadline: Date,
    skills: string[]
}

export const createProjectSchema = Joi.object({
    title: Joi.string().required().min(3).max(30),
    categoryId: Joi.string().required(),
    shortDescription: Joi.string().max(500).required(),
    fullReadme: Joi.string().allow('').max(10000).optional(),
    deadline: Joi.date().optional(),
    skills: Joi.array().items(Joi.string()).required(),
})
