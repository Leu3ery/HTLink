import Joi from "joi";
import { ProjectStatus } from "../projects.model";

export type ListProjectsQueryDto = {
  search?: string;
  category?: string;
  status?: string;
  skills?: string[];
  page: number;
  limit: number;
};

export const listProjectsQuerySchema = Joi.object<ListProjectsQueryDto>({
  search: Joi.string().trim().allow("").default(""),
  category: Joi.string().hex().length(24).optional(),
  status: Joi.string()
    .custom((value, helpers) => {
      const val = String(value);
      const matched = (Object.values(ProjectStatus) as string[]).find(
        (v) => v.toLowerCase() === val.toLowerCase()
      );
      if (!matched) return helpers.error("any.invalid");
      return matched;
    })
    .optional(),
  skills: Joi.array()
    .items(Joi.string().hex().length(24))
    .single()
    .default([]),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(true);