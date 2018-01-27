import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { withFilter, PubSub } from 'graphql-subscriptions';
import { requireAuth } from '../permission';

const pubsub = new PubSub();
const NEW_MESSAGE = 'NEW_MESSAGE';

const ObjectId = mongoose.Types.ObjectId;

export default {
  Query: {
    allMessages: async (root, { skip }, { User, Message }) => {
      const messages = await Message.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(2);

      console.log('messages', messages);

      messages.forEach((m) => {
        m._id = m._id.toString();
      });

      return messages;
    },
    message: async (root, { id }, { User, Message }) => {
      const theMessage = await Message.findOne({ _id: ObjectId(id) });
      theMessage._id = theMessage._id.toString();
      console.log('theMessage', theMessage);

      return theMessage;
    },
  },
  Mutation: {
    createMessage: requireAuth.createResolver(async (root, { content }, { user, Message }) => {
      console.log('user', user);

      const newMessage = await new Message({
        userId: user._id,
        content,
        votes: [],
        owner: user.name,
      }).save();

      console.log('newMessage', newMessage);

      const payload = newMessage;
      console.log('payload', payload);

      pubsub.publish(NEW_MESSAGE, {
        newMessageAdded: payload,
      });

      return {
        ok: true,
        error: false,
        message: newMessage,
      };
    }),
  },

  Subscription: {
    newMessageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_MESSAGE),
        (payload, args) => {
          console.log('payload', payload);
          console.log('args', args);

          return payload.newMessageAdded.userId !== args.userId;
        },
      ),
    },
  },
};

/**
 * add with filter to not optimistic mixed with subscription
 * to know the user should know the context with this userId?
 *
 */

//  withFilter(() => pubsub.asyncIterator(NEW_MESSAGE),
//     (payload, variables) => payload.user._id !== payload.newMessageAdded.userId,)
