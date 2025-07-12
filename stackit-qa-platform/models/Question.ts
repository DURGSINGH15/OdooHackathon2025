import { Schema, model, Document } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  description: string;
  author: Schema.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  title:        { type: String, required: true, index: true },
  description:  { type: String, required: true },
  author:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tags:         { type: [String], required: true, index: true },
  createdAt:    { type: Date, default: Date.now, index: true },
  updatedAt:    { type: Date, default: Date.now }
});

QuestionSchema.index(
  { title: 'text', description: 'text' },
  { name: 'QuestionTextIndex', default_language: 'english' }
);
QuestionSchema.index({ tags: 1, createdAt: -1 });

export const Question = model<IQuestion>('Question', QuestionSchema);