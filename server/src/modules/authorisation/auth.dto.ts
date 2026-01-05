import Joi from 'joi'

export interface LoginDTO {
	login: string,
	password: string
}

export const LoginSchema = Joi.object<LoginDTO>({
	login: Joi.string().required(),
	password: Joi.string().required()
})

