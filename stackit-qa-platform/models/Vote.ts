import { Schema, model, Document } from 'mongoose';

export interface IVote extends Document {
  user: Schema.Types.ObjectId;
  answer: Schema.Types.ObjectId;
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  user:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  answer:    { type: Schema.Types.ObjectId, ref: 'Answer', required: true, index: true },
  voteType:  { type: String, enum: ['upvote','downvote'], required: true },
  createdAt: { type: Date, default: Date.now }
});

VoteSchema.index({ user: 1, answer: 1 }, { unique: true });

export const Vote = model<IVote>('Vote', VoteSchema);