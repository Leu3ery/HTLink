import { HydratedDocument, model, Schema, Types } from "mongoose";

export interface IOffer {
    _id: Types.ObjectId,
    title: string,
    description: string,
    phoneNumber: string,
    price?: number,
    photo_path?: string,
    skills: Types.ObjectId[],
    ownerId: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}

export const offerSchema = new Schema<IOffer>({
    title: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return /^\+?[1-9]\d{7,14}$/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid phone number!`
        },
    },
    price: {
        type: Number,
        required: false,
    },
    photo_path: {
        type: String,
        required: false,
        trim: true,
    },
    skills: {
        type: [Schema.Types.ObjectId],
        ref: 'Skill',
        required: false,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
})

export const Offer = model<IOffer>("Offer", offerSchema)
export type OfferDocument = HydratedDocument<IOffer>