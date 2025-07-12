import { Schema, model, Document } from 'mongoose';
import { Answer } from './Answer.ts'; // import the Answer model to update counters

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

// enforce one vote per user per answer
VoteSchema.index({ user: 1, answer: 1 }, { unique: true });

// Mongoose middleware to keep Answer vote counters in sync
VoteSchema.post('save', async function (doc: IVote) {
  const inc = doc.voteType === 'upvote'
    ? { upvotes: 1 }
    : { downvotes: 1 };
  await Answer.updateOne({ _id: doc.answer }, { $inc: inc });
});

VoteSchema.post('deleteOne', async function (doc: IVote) {
  const inc = doc.voteType === 'upvote'
    ? { upvotes: -1 }
    : { downvotes: -1 };
  await Answer.updateOne({ _id: doc.answer }, { $inc: inc });
});

export const Vote = model<IVote>('Vote', VoteSchema);