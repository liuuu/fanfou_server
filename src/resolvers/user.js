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
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const secrets = {
  JWT_SECRET: '123456',
};

export default {
  Query: {
    allUsers: async (root, agrs, { User }) => {
      const allUsers = await User.find();
      return allUsers;
    },
  },
  Mutation: {
    signup: async (root, { name, email, password }, { User }) => {
      // change find to findOne ,cause find always return array;
      const existingUser = await User.findOne({ email });

      console.log('existingUser', existingUser);

      if (existingUser) {
        return {
          ok: false,
          error: 'Email has been used',
        };
      }

      const hash = await bcrypt.hash(password, 10);

      const newUser = await new User({
        name,
        email,
        password: hash,
      }).save();

      newUser.token = jwt.sign({ _id: newUser._id }, secrets.JWT_SECRET);
      newUser._id = newUser._id.toString();

      return {
        user: newUser,
        ok: true,
      };
    },
    login: async (root, { email, password }, { User }) => {
      const user = await User.find({ email });

      if (!user) {
        return {
          ok: false,
          error: 'no this user',
        };
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error('Password is incorrect');
      }

      user.token = jwt.sign({ _id: user._id }, secrets.JWT_SECRET);
      user._id = user._id.toString();

      return {
        user,
        ok: true,
      };
    },
  },
};
