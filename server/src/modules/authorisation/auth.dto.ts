import Joi from 'joi'

export interface LoginDTO {
	mail: string,
	password: string
}

export const LoginSchema = Joi.object<LoginDTO>({
	mail: Joi.string().pattern(/^[a-zA-Z]+\.[a-zA-Z]+@htlstp\.at$/).required(),
	password: Joi.string().required()
})

export interface SendCodeDTO {
	email: string
}

export const SendCodeSchema = Joi.object<SendCodeDTO>({
	email: Joi.string()
		.pattern(/^[a-zA-Z]+\.[a-zA-Z]+@htlstp\.at$/)
		.required()
		.messages({
			'string.pattern.base': 'Email must be in the format firstname.lastname@htlstp.at'
		})
})

export interface VerifyCodeDTO {
	email: string
	code: number
}

export const VerifyCodeSchema = Joi.object<VerifyCodeDTO>({
	email: Joi.string().pattern(/^[a-zA-Z]+\.[a-zA-Z]+@htlstp\.at$/).required(),
	code: Joi.number().min(1000).max(9999).required()
})