// /app/api/auth/[...nextauth]/route.js

import clientPromise from "@/libs/mongoConnect";
import { UserInfo } from "@/models/UserInfo"; // Adjust or remove if unused
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "@/models/User";
import NextAuth from "next-auth"; 
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

// Define the authOptions used for authentication
const authOptions = {
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.username;
        const password = credentials?.password;

        await mongoose.connect(process.env.MONGO_URL);
        const user = await User.findOne({ email });
        const passwordOk = user && bcrypt.compareSync(password, user.password);

        // Return user if password is correct, otherwise return null
        if (passwordOk) {
          return user;
        }

        return null;
      },
    }),
  ],
};

// Initialize NextAuth handler
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };
