export const typeDefs = `#graphql
  type Contest {
    id: ID!
    title: String!
    prompt: String!
    deadline: String!
    status: String!
  }

  type Query {
    healthCheck: String!
    contests: [Contest!]!
    contest(id: ID!): Contest
  }
`