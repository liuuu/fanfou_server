"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const FolSchema = new Schema({
  userId: String
});
const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  num: Number,
  followers: [FolSchema],
  followings: [FolSchema],
  avatarUrl: String
}, {
  timestamps: Date
});

const User = _mongoose.default.model('user', UserSchema);

module.exports = User;