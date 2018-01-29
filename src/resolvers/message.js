import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { withFilter, PubSub } from 'graphql-subscriptions';
import { requireAuth } from '../permission';
import message from '../schema/message';

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
    message: async (root, { _id }, { User, Message }) => {
      const theMessage = await Message.findOne({ _id: ObjectId(_id) });
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
        avatarUrl: user.avatarUrl,
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
    removeMessage: async (root, { _id }, { Message, user }) => {
      // find me message and owner even though fe
      const theMessage = await Message.findOne({ _id: ObjectId(_id) });
      const isOwner = theMessage.userId === user._id;
      if (!isOwner) {
        return {
          ok: false,
          error: '你不是主人',
        };
      }
      // how to effectively delete a item form mongodb
      const result = await Message.findOneAndRemove({ _id: ObjectId(_id) });
      return {
        ok: true,
        error: false,
        message: result,
      };
    },

    createVote: async (root, { _id }, { Message, user }) => {
      // https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
      // Users.findOneAndUpdate({name: req.user.name}, {$push: {friends: friend}});
      const theMessage = await Message.findOne({ _id: ObjectId(_id) });
      console.log('theMessage', theMessage);

      const alreadyVote = theMessage.votes.find(v => v.userId === user._id);
      if (alreadyVote) {
        return theMessage;
      }
      theMessage.votes.push({ userId: user._id });
      await theMessage.save();
      console.log('theMessage', theMessage);

      return theMessage;
    },

    removeVote: async (root, { _id }, { Message, user }) => {
      const theMessage = await Message.findOne({ _id: ObjectId(_id) });
      console.log('theMessage', theMessage);

      // const alreadyVote = theMessage.votes.find(v => v.userId === user._id);
      // if (alreadyVote) {
      //   return theMessage;
      // }
      const idx = theMessage.votes.findIndex(v => v.userId === user._id);
      theMessage.votes.splice(idx, 1);
      await theMessage.save();
      console.log('theMessage', theMessage);
      return theMessage;
    },
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
