import Joi from 'joi'
import { Department, departmentsList } from './users.model'

export interface UpdateMeDTO {
	description?: string,
	photo_path?: string,
	github_link?: string,
	linkedin_link?: string,
	banner_link?: string,
	skills?: string[],
	class?: string,
	department?: Department,
	password?: string,
}

export const UpdateMeSchema = Joi.object<UpdateMeDTO>({
	description: Joi.string().max(300).optional(),
	photo_path: Joi.string().max(100).optional(),
	github_link: Joi.string().max(100).optional(),
	linkedin_link: Joi.string().max(100).optional(),
	banner_link: Joi.string().max(100).optional(),
	skills: Joi.array().items(Joi.string()).optional(),
	class: Joi.string().pattern(/^[1-5][A-Z]{1}[A-Z]{2,4}$/i).optional(),
	department: Joi.string().valid(...departmentsList).optional(),
	password: Joi.string().optional(),
}).min(1).required()


export interface GetUsersDTO {
	department?: Department,
	class?: string,
	nameContains?: string,
	offset: number,
	limit: number
}

export const GetUsersSchema = Joi.object<GetUsersDTO>({
	department: Joi.string().valid(...departmentsList).optional(),
	class: Joi.string().optional(),
	nameContains: Joi.string().min(1).max(20).optional(),
	offset: Joi.number().min(0).default(0),
	limit: Joi.number().positive().max(50).default(20)
})
