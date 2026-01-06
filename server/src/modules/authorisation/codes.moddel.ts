import { model, Schema, Types } from "mongoose";

export interface ICode {
  _id: Types.ObjectId;
  email: string;
  hash_code: string;
  attempts: number;
  expires_at: Date;
  created_at: Date;
}

export const codeSchema = new Schema<ICode>({
  email: { type: String, required: true },
  hash_code: { type: String, required: true },
  attempts: { type: Number, required: true, default: 5 },
  expires_at: { type: Date, required: true, default: new Date(Date.now() + 20 * 60 * 1000) },
  created_at: { type: Date, required: true, default: Date.now },
});

export const Code = model<ICode>("Code", codeSchema);