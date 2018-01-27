export default `
 type Vote {
   userId: String
 }

 type Message {
   _id: String!
  content: String!
  createdAt: String!
  userId: String!
  owner: String!
  votes:[Vote]
 }



 type MessageResponse {
   ok: Boolean,
   error: String,
   message: Message
 }

  type Query {
   allMessages(skip: Int!): [Message]
   message(_id: String!) : Message
 }



 type Mutation {
    createMessage(content: String!): MessageResponse
    createVote(_id:String!): Message
    removeVote(_id:String!): Message
  }

 type Subscription {
    newMessageAdded(userId: String!) : Message
  }
`;
