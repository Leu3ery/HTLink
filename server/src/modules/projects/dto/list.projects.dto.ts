import Joi from "joi";
import { ProjectStatus } from "../projects.model";

export type ListProjectsQueryDto = {
  search?: string;
  category?: string;
  status?: string;
  skills?: string[];
  page?: number;
  limit?: number;
  ownerId?: string;
};

export const listProjectsQuerySchema = Joi.object<ListProjectsQueryDto>({
  search: Joi.string().trim().allow("").default(""),
  category: Joi.string().hex().length(24).optional(),
  status: Joi.string().valid(...Object.values(ProjectStatus)).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10).optional(),
  ownerId: Joi.string().hex().length(24).optional(),
}).unknown(true);