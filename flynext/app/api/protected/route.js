// app/api/protected/route.js
// import { verifyToken } from "../../../utils/auth";
// import { NextResponse } from "next/server";

export async function GET(request) {
  /*
    USER STORY FROM PROJECT DESCRIPTION:
    As a user, I want to sign up, log in, log out, and edit my profile. Profile 
    information includes first and last name, email, profile picture, and phone 
    number. Authentication should be handled with a proper JWT setup.
  */

  try {
    // 1. Get the Authorization header from request
    // 2. Verify the token using verifyToken() with ACCESS_SECRET
    // 3. If valid, return some protected data
    // return NextResponse.json({ data: "Protected content for authenticated users" });
  } catch (error) {
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}