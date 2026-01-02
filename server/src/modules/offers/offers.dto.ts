import Joi from "joi"


export interface CreateOfferDTO {
    title: string,
    description: string,
    phoneNumber: string,
    price?: number,
    photo_path?: string,
    skills: string[]
}

export const CreateOfferSchema = Joi.object<CreateOfferDTO>({
    title: Joi.string().max(100).required(),
    description: Joi.string().max(1000).required(),
    phoneNumber: Joi.string()
        .pattern(/^\+?[1-9]\d{7,14}$/)
        .required()
        .messages({
            "string.pattern.base": "Phone number must be a valid international phone number",
        }),
    price: Joi.number().optional(),
    photo_path: Joi.string().optional(),
    skills: Joi.array().items(Joi.string()).required()
})

export interface UpdateOfferDTO {
    title?: string,
    description?: string,
    phoneNumber?: string,
    price?: number,
    photo_path?: string,
    skills: string[]
}

export const UpdateOfferSchema = Joi.object<UpdateOfferDTO>({
    title: Joi.string().max(100).optional(),
    description: Joi.string().max(1000).optional(),
    phoneNumber: Joi.string()
        .pattern(/^\+?[1-9]\d{7,14}$/)
        .optional()
        .messages({
            "string.pattern.base": "Phone number must be a valid international phone number",
        }),
    price: Joi.number().optional(),
    photo_path: Joi.string().optional(),
    skills: Joi.array().items(Joi.string()).default([])
})

export interface GetOffersDTO {
    title?: string,
    skills: string[],
    offset: number,
    limit: number
}

export const GetOffersSchema = Joi.object<GetOffersDTO>({
    title: Joi.string().max(100).optional(),
    skills: Joi.array().items(Joi.string()).default([]),
    offset: Joi.number().min(0).default(0),
    limit: Joi.number().positive().max(50).default(20)
})