import clientPromise from "@/libs/mongoConnect";
import { UserInfo } from "@/models/UserInfo";
import bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { User } from "@/models/User";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getServerSession } from "next-auth/next";

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
        mongoose.connect(process.env.MONGO_URL);
        
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

// Function to check if the user is an admin
export async function isAdmin() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  
  if (!userEmail) {
    return false;
  }

  // Check if the user has admin privileges
  const userInfo = await UserInfo.findOne({ email: userEmail });
  if (!userInfo) {
    return false;
  }

  return userInfo.admin;
}

// NextAuth handler for authentication routes
const handler = NextAuth(authOptions);

// Exporting the GET and POST methods to handle requests
export { handler as GET, handler as POST };
