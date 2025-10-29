import Joi from 'joi'
import { Department, departmentsList, rolesList } from './users.model'

export interface LoginDTO {
	login: number,
	password: string
}

export const LoginSchema = Joi.object<LoginDTO>({
	login: Joi.number().required(),
	password: Joi.string().required()
})

export interface UpdateMeDTO {
	first_name?: string,
	last_name?: string,
	description?: string,
	department?: Department,
	class?: string,
	photo_path?: string,
	github_link?: string,
	linkedin_link?: string,
	banner_link?: string
}

export const UpdateMeSchema = Joi.object<UpdateMeDTO>({
	first_name: Joi.string().min(3).max(20).optional(),
	last_name: Joi.string().min(3).max(20).optional(),
	description: Joi.string().max(300).optional(),
	department: Joi.string().valid(...departmentsList).optional(),
	class: Joi.string().regex(/^[1-5][A-Z]{1}[A-Z]{2,4}$/i).optional(),
	photo_path: Joi.string().max(100).optional(),
	github_link: Joi.string().max(100).optional(),
	linkedin_link: Joi.string().max(100).optional(),
	banner_link: Joi.string().max(100).optional()
}).min(1).required()


export interface GetUsersDTO {
	department?: Department,
	class?: string,
	nameContains?: string,
	pc_id?: number,
	offset: number,
	limit: number
}

export const GetUsersSchema = Joi.object<GetUsersDTO>({
	department: Joi.string().valid(...departmentsList).optional(),
	class: Joi.string().regex(/^[1-5][A-Z]{1}[A-Z]{2,4}$/i).optional(),
	nameContains: Joi.string().min(1).max(20).optional(),
	pc_id: Joi.number().optional(),
	offset: Joi.number().min(0).default(0),
	limit: Joi.number().positive().max(100).default(50)
})