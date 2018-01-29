import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const VoteSchema = new Schema({
  userId: String,
});

const MessageSchema = new Schema(
  {
    content: String,
    userId: String,
    owner: String,
    votes: [VoteSchema],
    avatarUrl: String,
  },
  { timestamps: Date },
);

const Message = mongoose.model('message', MessageSchema);
module.exports = Message;
