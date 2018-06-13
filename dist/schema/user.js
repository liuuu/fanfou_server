"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = `

  type FolUser {
    _id: String
  }

 type User {
   _id: String
   name: String
   email: String
   token: String
   num: Int
   followers:[FolUser]
   followings:[FolUser]
   hisMessages:[Message]
   messageCount: Int 
   avatarUrl: String  
   likedMessagesCount: Int
 }

 type LoginResponse {
   user: User,
   ok: Boolean,
   error: String
 }

 type Query {
   allUsers:[User]
   user(id:String): User
 }



 type Mutation {
    login(email: String!, password: String!): LoginResponse!
    signup(name: String!, email: String!, password: String!): LoginResponse!
  }
`;
exports.default = _default;