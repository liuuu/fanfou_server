import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    content: String,
    userId: String,
  },
  { timestamps: Date },
);

const Message = mongoose.model('message', MessageSchema);
module.exports = Message;
