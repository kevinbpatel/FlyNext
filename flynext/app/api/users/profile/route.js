// The below code is generated by Claude 3.7

// app/api/users/profile/route.js
import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { authenticate } from "@/utils/auth";

export async function GET(request) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Handle user ID from authentication result
    const userId = typeof authResult === 'object' ? authResult.id : authResult;
    if (!userId) {
      return NextResponse.json({ error: "Invalid user authentication" }, { status: 401 });
    }
    
    // Fetch user profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        themePreference: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ 
      error: "Failed to fetch profile",
      details: error.message 
    }, { status: 500 });
  }
}