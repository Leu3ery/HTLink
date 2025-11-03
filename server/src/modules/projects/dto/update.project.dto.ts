import Joi from "joi";
import { ProjectStatus } from "../projects.model";

export type UpdateProjectDto = {
    title: string;
    category: string;
    shortDescription: string;
    fullReadme: string;
    deadline: string;
    status: string;
    skills: string[];
};

export const updateProjectSchema = Joi.object({
    title: Joi.string().required().min(3).max(30),
    categoryId: Joi.string().required(),
    shortDescription: Joi.string().required().min(10).max(500),
    fullReadme: Joi.string().max(10000),
    deadline: Joi.date().required(),
    skills: Joi.array().items(Joi.string()).required(),
    status: Joi.string().valid(...Object.values(ProjectStatus)).required(),
    
})
