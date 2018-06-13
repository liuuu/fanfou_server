"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _message = _interopRequireDefault(require("../schema/message"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// const secrets = {
//   JWT_SECRET: '123456',
// };
// export default {
//   Query: {
//     allUser: [{ name: 'f' }, { name: 'sdf' }],
//   },
//   Mutation: {
//     signup: async (root, { name, email, password }, { db }) => {
//       const Users = await db.collection('users');
//       const existingUser = await Users.findOne({ email });
//       if (existingUser) {
//         throw new Error('Email already used');
//       }
//       const hash = await bcrypt.hash(password, 10);
//       await Users.insert({
//         name,
//         password: hash,
//         email,
//         date: { type: Date, default: Date.now },
//       });
//       const newUser = await Users.findOne({ email });
//       // console.log('existingUser', existingUser);
//       newUser.token = jwt.sign({ _id: newUser._id }, secrets.JWT_SECRET);
//       return newUser;
//     },
//     login: async (root, { email, password }, { db }) => {
//       const Users = db.collection('users');
//       const user = await Users.findOne({ email });
//       if (!user) {
//         throw new Error('Email not found');
//       }
//       const validPassword = await bcrypt.compare(password, user.password);
//       if (!validPassword) {
//         throw new Error('Password is incorrect');
//       }
//       user.token = jwt.sign({ _id: user._id }, secrets.JWT_SECRET);
//       return user;
//     },
//   },
// };
const {
  ObjectId
} = _mongoose.default.Types;
const secrets = {
  JWT_SECRET: '123456'
};
var _default = {
  Query: {
    allUsers: async (root, agrs, {
      User
    }) => {
      const allUsers = await User.find();
      return allUsers;
    },
    user: async (root, {
      id
    }, {
      User,
      Message
    }) => {
      const user = await User.findOne({
        _id: ObjectId(id)
      });
      console.log('user', user);
      console.log('id', id);

      if (!user) {
        return null;
      }

      const hisMessages = await Message.find({
        userId: id
      }).sort({
        createdAt: -1
      }).limit(10); // PersonModel.find({ favouriteFoods: { "$in" : ["sushi"]} }, ...);

      const likedMessagesCount = await Message.find({
        'votes.userId': id
      }); // https://stackoverflow.com/questions/10811887/how-to-get-all-count-of-mongoose-model

      const messageCount = await Message.count({
        userId: id
      });
      user.hisMessages = hisMessages || [];
      user.messageCount = messageCount;
      user.likedMessagesCount = likedMessagesCount.length;
      return user;
    }
  },
  Mutation: {
    signup: async (root, {
      name,
      email,
      password
    }, {
      User
    }) => {
      // change find to findOne ,cause find always return array;
      const existingUser = await User.findOne({
        email
      });
      console.log('existingUser', existingUser);

      if (existingUser) {
        return {
          ok: false,
          error: 'Email has been used'
        };
      }

      const hash = await _bcrypt.default.hash(password, 10);
      const randomNum = Math.floor(Math.random() * 1000);
      const avatarUrl = `https://picsum.photos/300/300?image=${randomNum}`;
      const newUser = await new User({
        name,
        email,
        password: hash,
        num: randomNum,
        avatarUrl
      }).save();
      newUser.token = _jsonwebtoken.default.sign({
        _id: newUser._id,
        name,
        email,
        avatarUrl: newUser.avatarUrl
      }, secrets.JWT_SECRET);
      newUser._id = newUser._id.toString();
      return {
        user: newUser,
        ok: true
      };
    },
    login: async (root, {
      email,
      password
    }, {
      User
    }) => {
      const user = await User.findOne({
        email
      });

      if (!user) {
        return {
          ok: false,
          error: 'no this user'
        };
      }

      console.log('password', password);
      console.log('user.password', user.password);
      console.log('user', user);
      const validPassword = await _bcrypt.default.compare(password, user.password);

      if (!validPassword) {
        return {
          ok: false,
          error: 'invalid pasword'
        };
      }

      user.token = _jsonwebtoken.default.sign({
        _id: user._id,
        name: user.name,
        email,
        avatarUrl: user.avatarUrl
      }, secrets.JWT_SECRET);
      user._id = user._id.toString();
      console.log('user', user);
      return {
        user,
        ok: true
      };
    }
  }
};
exports.default = _default;