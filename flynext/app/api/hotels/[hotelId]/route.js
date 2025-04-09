// app/api/hotels/[hotelId]/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";
import { saveHotelImage, deleteHotelImage } from "@/utils/Images"; // Image utility functions
import { Buffer } from "buffer";

export async function GET(request, { params }) {
  try {
    // Authenticate user
    const userId = await authenticate(request);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    // Get hotel ID from params - properly awaited
    const { hotelId } = await params;
    if (!hotelId) return NextResponse.json({ message: "Hotel ID required" }, { status: 400 });
    
    // Fetch hotel with room details
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { rooms: true }
    });
    
    if (!hotel) return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    if (hotel.ownerId !== userId) return NextResponse.json({ message: "Permission denied" }, { status: 403 });
    
    return NextResponse.json({ 
      message: "Hotel fetched successfully", 
      hotel 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotel:", error.message || "Unknown error");
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Step 1: Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Get hotel ID from params - properly awaited
    const { hotelId } = params;
    if (!hotelId) {
      return NextResponse.json({ message: "Hotel ID required" }, { status: 400 });
    }

    // Step 3: Parse form data
    const formData = await request.formData();

    // Step 4: Fetch the existing hotel
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    if (hotel.ownerId !== userId) {
      return NextResponse.json({ message: "Permission denied" }, { status: 403 });
    }

    // Step 5: Extract and validate updatable fields
    let updates = {};
    
    // Handle basic fields
    const name = formData.get("name");
    if (name) {
      updates.name = name;
    }
    
    const starRatingValue = formData.get("starRating");
    if (starRatingValue) {
      const starRating = parseInt(starRatingValue);
      if (starRating < 1 || starRating > 5) {
        return NextResponse.json({ message: "Star rating must be between 1 and 5" }, { status: 400 });
      }
      updates.starRating = starRating;
    }
    
    // Handle address
    const addressValue = formData.get("address");
    if (addressValue) {
      try {
        updates.address = JSON.parse(addressValue);
      } catch (error) {
        return NextResponse.json({ message: "Invalid address format" }, { status: 400 });
      }
    }

    // Step 6: Process Logo (if provided)
    const logo = formData.get("logo");
    if (logo instanceof Blob && logo.size > 0) {
      const arrayBuffer = await logo.arrayBuffer();
      const logoBuffer = Buffer.from(arrayBuffer);
      const logoPath = saveHotelImage(logoBuffer, hotelId, "logo.png");

      if (logoPath) {
        updates.logo = logoPath;

        // Delete old logo if it exists
        if (hotel.logo) {
          deleteHotelImage(hotel.logo);
        }
      }
    }

    // Step 7: Handle Image Updates
    // Find all existing image keys from the form data
    const incomingImageKeys = [];
    for (const key of formData.keys()) {
      // Extract keys that match the pattern imageN (e.g., image1, image2, etc.)
      if (/^image\d+$/.test(key)) {
        incomingImageKeys.push(key);
      }
    }
    
    console.log("Incoming image keys:", incomingImageKeys);

    // Start with an empty object for the updated images
    const updatedImages = {};
    
    // First, handle deletion of images that are no longer in the form
    if (hotel.images) {
      console.log("Existing hotel images:", hotel.images);
      
      // Find images that need to be deleted (not in the incoming keys)
      for (const [key, path] of Object.entries(hotel.images)) {
        if (!incomingImageKeys.includes(key)) {
          console.log(`Deleting image: ${key} at path: ${path}`);
          deleteHotelImage(path);
          // Don't include this image in updatedImages
        } else {
          // Keep existing images that are still in the form
          updatedImages[key] = path;
        }
      }
    }
    
    // Now process the new/updated images
    for (const key of incomingImageKeys) {
      const imageFile = formData.get(key);
      if (imageFile instanceof Blob && imageFile.size > 0) {
        // If there's an existing image with this key, delete it
        if (hotel.images && hotel.images[key]) {
          console.log(`Replacing image: ${key} at path: ${hotel.images[key]}`);
          deleteHotelImage(hotel.images[key]);
        }
        
        // Save the new image
        const arrayBuffer = await imageFile.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const imagePath = saveHotelImage(imageBuffer, hotelId, `${key}.png`);
        
        if (imagePath) {
          updatedImages[key] = imagePath;
        }
      }
    }
    
    console.log("Final updated images:", updatedImages);
    
    // Update the hotel with the new image set
    updates.images = updatedImages;

    // Step 8: Update Hotel in Database
    const updatedHotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: updates,
    });

    return NextResponse.json({
      message: "Hotel updated successfully",
      hotel: updatedHotel,
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating hotel:", error.message || "Unknown error");
    return NextResponse.json({ 
      message: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}