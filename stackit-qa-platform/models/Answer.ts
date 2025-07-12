import { Schema, model, Document } from 'mongoose';

export interface IAnswer extends Document {
  question: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  content: string;
  isAccepted: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  question:    { type: Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
  author:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content:     { type: String, required: true },
  isAccepted:  { type: Boolean, default: false, index: true },

  upvotes:     { type: Number, default: 0 },
  downvotes:   { type: Number, default: 0 },

  createdAt:   { type: Date, default: Date.now, index: true },
  updatedAt:   { type: Date, default: Date.now }
});

AnswerSchema.index({ question: 1, upvotes: -1, downvotes: 1 });

export const Answer = model<IAnswer>('Answer', AnswerSchema);