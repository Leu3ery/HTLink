import {Model, Schema, model, Types, HydratedDocument} from 'mongoose'

export interface ISkill {
	_id: Types.ObjectId,
	name: string
}

export const skillSchema = new Schema<ISkill>({
	name: {
		type: String,
		unique: true,
		required: true
	}
})

export const Skill = model<ISkill>("Skill", skillSchema)