import { model, Schema, Types } from "mongoose"

export interface IImage {
    _id: Types.ObjectId,
    image_path: string,
    projectId: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}

export const imageSchema = new Schema<IImage>({
    image_path: {
        type: String,
        required: true
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    }}
, {
    timestamps: true
})

export const Image = model<IImage>("Image", imageSchema)