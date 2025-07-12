import mongoose from "mongoose";
import { User } from "../models/User.ts";
import { Question } from "../models/Question.ts";
import { Answer } from "../models/Answer.ts";
import { Vote } from "../models/Vote.ts";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not set. Please check your .env file and ensure it is in the project root.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // 1. Insert users
  const users = await User.insertMany([
    {
      username: "user1",
      email: "user1@user.com",
      passwordHash: "password1",
      avatarUrl: "https://example.com/avatar1.jpg",
      isAdmin: false,
      createdAt: new Date(),
      notifications: []
    },
    {
      username: "user2",
      email: "user2@user.com",
      passwordHash: "password2",
      avatarUrl: "https://example.com/avatar2.jpg",
      isAdmin: false,
      createdAt: new Date(),
      notifications: []
    },
    {
      username: "user3",
      email: "user3@user.com",
      passwordHash: "password3",
      avatarUrl: "https://example.com/avatar3.jpg",
      isAdmin: false,
      createdAt: new Date(),
      notifications: []
    }
  ]);

  // 2. Insert questions
  const questions = await Question.insertMany([
    {
      title: "Question 1",
      description: "<b>Is this a quesiton?</b>",
      author: users[0]._id,
      tags: ["tag1", "tag2", "tag3"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Question 2",
      description: "<i>Is this italics a quesiton?</i>",
      author: users[1]._id,
      tags: ["tag1", "tag2", "tag3"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Question 3",
      description: "<u>Is this underline a quesiton?</u>",
      author: users[2]._id,
      tags: ["tag1", "tag2", "tag3"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 3. Insert answers
  const answers = await Answer.insertMany([
    {
      question: questions[0]._id,
      author: users[0]._id,
      content: "Answer 1",
      isAccepted: false,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      question: questions[1]._id,
      author: users[1]._id,
      content: "Answer 2",
      isAccepted: false,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      question: questions[2]._id,
      author: users[2]._id,
      content: "Answer 3",
      isAccepted: false,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 4. Insert votes
  await Vote.insertMany([
    {
      user: users[0]._id,
      answer: answers[0]._id,
      voteType: "upvote",
      createdAt: new Date()
    },
    {
      user: users[1]._id,
      answer: answers[1]._id,
      voteType: "downvote",
      createdAt: new Date()
    },
    {
      user: users[2]._id,
      answer: answers[2]._id,
      voteType: "upvote",
      createdAt: new Date()
    }
  ]);

  console.log("Data ingestion completed");
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});