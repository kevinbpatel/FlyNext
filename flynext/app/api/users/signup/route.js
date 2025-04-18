// The below code is generated by Claude 3.7

// app/api/users/register/route.js
import prisma from "@/utils/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { saveProfileImage, getDefaultProfileImage } from "@/utils/Images";
import { Buffer } from "buffer";

export async function POST(request) {
  try {
    // Check if request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    
    let userData = {};
    let profilePictureFile = null;
    
    if (contentType.includes('multipart/form-data')) {
      // Parse form data
      const formData = await request.formData();
      
      // Extract text fields
      userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone')
      };
      
      // Extract profile picture file
      profilePictureFile = formData.get('profilePicture');
    } else {
      // Handle JSON request
      userData = await request.json();
    }
    
    const { firstName, lastName, email, password, phone } = userData;
    
    // Validate all inputs
    if (!firstName || !lastName || !email || !password || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    
    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Set default profile picture
    let profilePicturePath = getDefaultProfileImage();
    
    // Create the user first to get the userId
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        phone,
        profilePicture: profilePicturePath // Set default initially
      },
    });
    
    // Process profile picture if provided
    if (profilePictureFile instanceof Blob) {
      const arrayBuffer = await profilePictureFile.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      const originalFileName = profilePictureFile.name || "profile.png";
      const savedPath = saveProfileImage(imageBuffer, newUser.id, originalFileName);
      
      if (savedPath) {
        profilePicturePath = savedPath;
        
        // Update the user with the profile picture path
        await prisma.user.update({
          where: { id: newUser.id },
          data: { profilePicture: profilePicturePath }
        });
      }
    }
    
    // Return user data without sensitive information
    const userResponse = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userResponse
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific database errors
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to register user", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}