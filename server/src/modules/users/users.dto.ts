import Joi from 'joi'

export interface LoginDTO {
	login: number,
	password: string
}

export const LoginSchema = Joi.object<LoginDTO>({
	login: Joi.number().required(),
	password: Joi.string().required()
})