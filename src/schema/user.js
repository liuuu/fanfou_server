export default `
 type User {
   _id: String
   name: String
   email: String
   token: String
 }

 type LoginResponse {
   user: User,
   ok: Boolean,
   error: String
 }

 type Query {
   allUsers:[User]
 }



 type Mutation {
    login(email: String!, password: String!): LoginResponse!
    signup(name: String!, email: String!, password: String!): LoginResponse!
  }
`;
