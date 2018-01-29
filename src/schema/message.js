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
  avatarUrl: String
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
    removeMessage(_id:String):MessageResponse
    createVote(_id:String!): Message
    removeVote(_id:String!): Message
  }

 type Subscription {
    newMessageAdded(userId: String!) : Message
  }
`;
