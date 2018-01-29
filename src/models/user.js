import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FolSchema = new Schema({
  userId: String,
});

const UserSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    num: Number,
    followers: [FolSchema],
    followings: [FolSchema],
    avatarUrl: String,
  },
  { timestamps: Date },
);

const User = mongoose.model('user', UserSchema);

module.exports = User;
