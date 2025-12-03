import Joi from "joi";
import { ProjectStatus } from "../projects.model";

export type UpdateProjectDto = {
    title?: string;
    categoryId?: string;
    shortDescription?: string;
    fullReadme?: string;
    deadline?: string;
    status?: string;
    skills?: string[];
};

export const updateProjectSchema = Joi.object({
    title: Joi.string().min(3).max(30).optional(),
    categoryId: Joi.string().optional(),
    shortDescription: Joi.string().min(10).max(500).optional(),
    fullReadme: Joi.string().allow('').max(10000).optional(),
    deadline: Joi.date().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid(...Object.values(ProjectStatus)).optional(),
})