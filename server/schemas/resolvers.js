const { User, Thought } = require("../models");
// AUTH: Back⎟⬇︎ Need to require for auth purpose // MODULE 21.2.3
const { AuthenticationError } = require("apollo-server-express");
// AUTH: Back⎟⬇︎ Import for JWT webtoken auth functionality // MODULE 21.2.4
const { signToken } = require("../utils/auth");
 

const resolvers = {
 /// QUERY OBJECT
 //  INFO: Queries are used to fetch data 𛰧GET𛰨  

  Query: {
    // AUTH: Back⎟⬇︎ me() method  // MODULE 21.2.5
    // ME QUERY
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("thoughts")
          .populate("friends");

        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
    // GET ALL THOUGHTS
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },
    // GET A SINGLE THOUGHT BY ID
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    },
    // GET ALL USERS
    users: async () => {
      return User.find()
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },
    // GET A SINGLE USER BY USERNAME
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },
  },

  /// MUTATION OBJECT
  //  INFO: Mutations are used to modify data 𛰧POST, PUT, DELETE𛰨
  Mutation: {
    // AUTH: Back⎟⬇︎ For authentication - add user // MODULE 21.2.3
    // ADD USER MUTATION
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    // AUTH: Back⎟⬇︎ For authentication - login mutation // MODULE 21.2.3
    // LOGIN MUTATION
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    // ADD THOUGHT MUTATION
    addThought: async (parent, args, context) => {
      if (context.user) {
        const thought = await Thought.create({
          ...args,
          username: context.user.username,
        });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { thoughts: thought._id } },
          { new: true }
        );

        return thought;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    // ADD REACTION MUTATION
    addReaction: async (parent, { thoughtId, reactionBody }, context) => {
      if (context.user) {
        const updatedThought = await Thought.findOneAndUpdate(
          { _id: thoughtId },
          {
            $push: {
              reactions: { reactionBody, username: context.user.username },
            },
          },
          { new: true, runValidators: true }
        );

        return updatedThought;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    // ADD FRIEND MUTATION
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { friends: friendId } },
          { new: true }
        ).populate('friends');
    
        return updatedUser;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    }
  },
};

module.exports = resolvers;
