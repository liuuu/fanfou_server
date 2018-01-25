import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { requireAuth } from '../permission';

const ObjectID = mongoose.Types.ObjectID;

export default {
  Query: {
    allMessages: async (root, agrs, { User, Message }) => {
      const messages = await Message.find({}).sort({ createdAt: -1 });

      messages.forEach((m) => {
        m._id = m._id.toString();
      });
      return messages;
    },
    message: async (root, { id }, { User, Message }) => {
      const theMessage = await Message.find({ id: ObjectID(id) });
      theMessage._id = theMessage._id.toString();
      return theMessage;
    },
  },
  Mutation: {
    createMessage: requireAuth.createResolver(async (root, { content }, { user, Message }) => {
      const newMessage = await new Message({
        userId: user._id,
        content,
      }).save();

      console.log('newMessage', newMessage);

      return {
        ok: true,
        error: false,
        message: newMessage,
      };
    }),
  },
};
