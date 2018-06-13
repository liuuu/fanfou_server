"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _graphqlSubscriptions = require("graphql-subscriptions");

var _permission = require("../permission");

var _message = _interopRequireDefault(require("../schema/message"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pubsub = new _graphqlSubscriptions.PubSub();
const NEW_MESSAGE = 'NEW_MESSAGE';
const ObjectId = _mongoose.default.Types.ObjectId;
var _default = {
  Query: {
    allMessages: async (root, {
      skip,
      userId
    }, {
      User,
      Message
    }) => {
      let messages;

      if (userId) {
        messages = await Message.find({
          userId
        }).sort({
          createdAt: -1
        }).skip(skip).limit(6);
      } else {
        messages = await Message.find({}).sort({
          createdAt: -1
        }).skip(skip).limit(6);
      }

      console.log('messages', messages);
      messages.forEach(m => {
        m._id = m._id.toString();
      });
      return messages;
    },
    message: async (root, {
      _id
    }, {
      User,
      Message
    }) => {
      const theMessage = await Message.findOne({
        _id: ObjectId(_id)
      });
      theMessage._id = theMessage._id.toString();
      console.log('theMessage', theMessage);
      return theMessage;
    }
  },
  Mutation: {
    createMessage: _permission.requireAuth.createResolver(async (root, {
      content
    }, {
      user,
      Message
    }) => {
      console.log('user', user);
      const newMessage = await new Message({
        userId: user._id,
        content,
        votes: [],
        owner: user.name,
        avatarUrl: user.avatarUrl
      }).save();
      console.log('newMessage', newMessage);
      const payload = newMessage;
      console.log('payload', payload);
      pubsub.publish(NEW_MESSAGE, {
        newMessageAdded: payload
      });
      return {
        ok: true,
        error: false,
        message: newMessage
      };
    }),
    removeMessage: async (root, {
      _id
    }, {
      Message,
      user
    }) => {
      // find me message and owner even though fe
      const theMessage = await Message.findOne({
        _id: ObjectId(_id)
      });
      const isOwner = theMessage.userId === user._id;

      if (!isOwner) {
        return {
          ok: false,
          error: '你不是主人'
        };
      } // how to effectively delete a item form mongodb


      const result = await Message.findOneAndRemove({
        _id: ObjectId(_id)
      });
      return {
        ok: true,
        error: false,
        message: result
      };
    },
    createVote: async (root, {
      _id
    }, {
      Message,
      user
    }) => {
      // https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
      // Users.findOneAndUpdate({name: req.user.name}, {$push: {friends: friend}});
      const theMessage = await Message.findOne({
        _id: ObjectId(_id)
      });
      console.log('theMessage', theMessage);
      const alreadyVote = theMessage.votes.find(v => v.userId === user._id);

      if (alreadyVote) {
        return theMessage;
      }

      theMessage.votes.push({
        userId: user._id
      });
      await theMessage.save();
      console.log('theMessage', theMessage);
      return theMessage;
    },
    removeVote: async (root, {
      _id
    }, {
      Message,
      user
    }) => {
      const theMessage = await Message.findOne({
        _id: ObjectId(_id)
      });
      console.log('theMessage', theMessage); // const alreadyVote = theMessage.votes.find(v => v.userId === user._id);
      // if (alreadyVote) {
      //   return theMessage;
      // }

      const idx = theMessage.votes.findIndex(v => v.userId === user._id);
      theMessage.votes.splice(idx, 1);
      await theMessage.save();
      console.log('theMessage', theMessage);
      return theMessage;
    }
  },
  Subscription: {
    newMessageAdded: {
      subscribe: (0, _graphqlSubscriptions.withFilter)(() => pubsub.asyncIterator(NEW_MESSAGE), (payload, args) => {
        console.log('payload', payload);
        console.log('args', args);
        if (!payload) return null;
        return payload.newMessageAdded.userId !== args.userId;
      })
    }
  }
};
/**
 * add with filter to not optimistic mixed with subscription
 * to know the user should know the context with this userId?
 *
 */
//  withFilter(() => pubsub.asyncIterator(NEW_MESSAGE),
//     (payload, variables) => payload.user._id !== payload.newMessageAdded.userId,)

exports.default = _default;