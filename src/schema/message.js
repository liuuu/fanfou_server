export default `
 type Message {
   _id: String!
  content: String!
  createdAt: String!
  userId: String!
 }



 type Query {
   allMessages(skip: Int!): [Message]
   message(id: String) : Message
 }

 type MessageResponse {
   ok: Boolean,
   error: String,
   message: Message
 }



 type Mutation {
    createMessage(content: String!): MessageResponse
  }

   type Subscription {
    newMessageAdded(userId: String!) : Message
  }
`;
