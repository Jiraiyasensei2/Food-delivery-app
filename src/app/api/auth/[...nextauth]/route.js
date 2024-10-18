import clientPromise from "@/libs/mongoConnect";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

// Define the authOptions used for authentication
export const authOptions = {
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        username: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.username;
        const password = credentials?.password;

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);

        // Find user by email
        const user = await User.findOne({ email });
        const passwordOk = user && bcrypt.compareSync(password, user.password);

        // Return user if password is correct, otherwise return null
        if (passwordOk) {
          return user;
        }

        return null;
      }
    }),
  ],
};

// NextAuth handler for authentication routes
const handler = NextAuth(authOptions);

// Exporting the GET and POST methods to handle requests
export { handler as GET, handler as POST };
