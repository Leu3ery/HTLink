import { model, Schema, Types } from "mongoose";
import { ISkill } from "../skills/skills.model";

export const departmentsList = ['IF', 'WI', 'MB', 'EL', "ETI"] as const
export type Department = (typeof departmentsList)[number]


export const rolesList = [
  "student",
  "teacher",
  "dep president",
  "school president",
  "director",
  "admin",
] as const
export type Role = (typeof rolesList)[number]


export interface IUser {
  _id: Types.ObjectId;
  first_name?: string | null;
  last_name?: string | null;
  description?: string | null;
  department?: Department | null;
  class?: string | null;
  photo_path?: string | null;
  role?: Role | null;
  github_link?: string | null;
  linkedin_link?: string | null;
  banner_link?: string | null;
  created_at?: Date;
  pc_number: number;
  skills?: Types.ObjectId[]
}

export const userSchema = new Schema<IUser>(
  {
    first_name: {
      type: String,
      minlength: 3,
      maxlength: 20,
      required: false,
      default: null,
    },
    last_name: {
      type: String,
      minlength: 3,
      maxlength: 20,
      required: false,
      default: null,
    },
    description: {
      type: String,
      maxlength: 300,
      required: false,
      default: null,
    },
    department: {
      type: String,
      enum: departmentsList,
      required: false,
      default: null,
    },
    class: {
      type: String,
      required: false,
      default: null,
      match: /^[1-5][A-Z]{1}[A-Z]{2,4}$/i,
    },
    photo_path: {
      type: String,
      maxlength: 100,
      required: false,
      default: null,
    },
    role: {
      type: String,
      enum: rolesList,
      required: false,
      default: "student",
    },
    github_link: {
      type: String,
      maxlength: 100,
      required: false,
      default: null,
    },
    linkedin_link: {
      type: String,
      maxlength: 100,
      required: false,
      default: null,
    },
    banner_link: {
      type: String,
      maxlength: 100,
      required: false,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    pc_number: {
      type: Number,
      unique: true,
      required: true
    },
    skills: {
      type: [Schema.Types.ObjectId],
      ref: "Skill",
      default: [],
    }
  },
  { versionKey: false }
);

export const User = model<IUser>("User", userSchema);