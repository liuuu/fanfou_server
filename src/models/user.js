import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    jwt: String,
  },
  { timestamps: Date },
);

const User = mongoose.model('user', UserSchema);

module.exports = User;
