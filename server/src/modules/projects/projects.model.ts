import { Model, Schema, model, Types, HydratedDocument } from "mongoose";
import { ISkill } from "../skills/skills.model";

export interface IProject {
    _id: Types.ObjectId,
    title: string,
    categoryId: Types.ObjectId,
    shortDescription: string,
    fullReadme: string,
    deadline?: Date,
    createdAt: Date,
    updatedAt: Date,
    skills: ISkill[],
    ownerId: Types.ObjectId,
    status: ProjectStatus,
    images: Types.ObjectId[],
}


// TODO separate in new table and add import script


export enum ProjectStatus {
    PLANNED = "Planned",
    IN_PROGRESS = "In progress",
    COMPLETED = "Completed",
    ON_HOLD = "On hold",
}

export const projectSchema = new Schema<IProject>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    },
    categoryId: {
        type: Schema.Types.ObjectId ,
        ref: 'ProjectCategory',
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    fullReadme: {
        type: String,
        required: false,
    },
    deadline: {
        type: Date,
        required: false
    },
    skills: [{
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        required: false
    }],
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: Object.values(ProjectStatus),
        default: ProjectStatus.PLANNED
    },
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Image',
        required: false
    }], 
}, {
    timestamps: true
});

export const Project = model<IProject>("Project", projectSchema);
export type ProjectDocument = HydratedDocument<IProject>;