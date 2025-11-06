import { model, Schema, Types } from "mongoose";

export interface ICategory {
    _id: Types.ObjectId,
    name: string
}

export const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true
    }
})

export const Category = model<ICategory>("Category", categorySchema)