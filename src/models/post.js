import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema({
  title: String,
  text: String,
});

// the schema is useless so far
// we need to create a model using it
const Post = mongoose.model('Post', postSchema);
export default Post;
