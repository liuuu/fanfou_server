"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const VoteSchema = new Schema({
  userId: String
});
const MessageSchema = new Schema({
  content: String,
  userId: String,
  owner: String,
  votes: [VoteSchema],
  avatarUrl: String
}, {
  timestamps: Date
});

const Message = _mongoose.default.model('message', MessageSchema);

module.exports = Message;