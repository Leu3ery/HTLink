import { validationWrapper } from "../../../common/utils/utils.wrappers";
import { ProjectStatus } from "../projects.model";
import Joi from "joi";

export type CreateProjectDto = {
    title: string,
    category: string,
    shortDescription: string,
    fullReadme: string,
    deadline: Date,
    skills: string[],
    ownerId: string
}

export const createProjectSchema = Joi.object({
    title: Joi.string().required().min(3).max(30),
    category: Joi.string().required(),
    shortDescription: Joi.string().required().min(10).max(500),
    fullReadme: Joi.string().max(10000),
    deadline: Joi.string().required(),
    skills: Joi.array().items(Joi.string()).required(),
})

export const createProjectDto = (data: any): CreateProjectDto => {
    return validationWrapper(createProjectSchema, data)
}