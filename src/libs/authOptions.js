import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  secret: process.env.SECRET,
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
        // Hardcoded User for demonstration (replace with your logic)
        const user = { email: "test@example.com", password: "$2b$10$C6UzMDM.H6dfI/f/IK/iHe5h0lRAaFwJWJPy/BrP5j6Elj7pV2A7e" }; // Bcrypt-hashed password for "password123"

        const email = credentials?.username;
        const password = credentials?.password;

        // Compare with hardcoded or API/user credentials
        const passwordOk = user && bcrypt.compareSync(password, user.password);

        if (email === user.email && passwordOk) {
          return user;
        }

        return null;
      },
    }),
  ],
};
