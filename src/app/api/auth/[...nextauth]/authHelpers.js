// /libs/authHelpers.js

import { getServerSession } from "next-auth/next";
import { UserInfo } from "@/models/UserInfo";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Function to check if the user is an admin
export async function isAdmin() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return false;
  }

  const userInfo = await UserInfo.findOne({ email: userEmail });
  if (!userInfo) {
    return false;
  }

  return userInfo.admin;
}
