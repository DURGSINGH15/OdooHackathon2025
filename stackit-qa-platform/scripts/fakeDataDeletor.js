import mongoose from "mongoose";
import User from "../models/User";
import Question from "../models/Question";
import Answer from "../models/Answer";
import Vote from "../models/Vote";

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit-qa';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Question.deleteMany({});
  await Answer.deleteMany({});
  await Vote.deleteMany({});

  console.log("All data deleted from User, Question, Answer, and Vote collections.");
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
