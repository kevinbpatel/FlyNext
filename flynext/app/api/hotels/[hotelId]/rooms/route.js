import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";
import { saveRoomImage } from "@/utils/Images";
import { Buffer } from "buffer";

export async function GET(request, { params }) {
  try {
    // Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract hotelId from route params
    const { hotelId } = await params;

    // Check if the hotel exists and belongs to the authenticated owner
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    if (hotel.ownerId !== userId) {
      return NextResponse.json({ 
        message: "Forbidden: You are not the owner of this hotel" 
      }, { status: 403 });
    }

    // Fetch all rooms for the hotel
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: {
        bookingRooms: {
          include: { booking: true }
        }
      }
    });

    // Format room data to match frontend expectations
    const roomTypes = rooms.map(room => ({
      id: room.id,
      name: room.type,
      pricePerNight: room.pricePerNight,
      capacity: 2, // Default capacity
      availableRooms: room.availableRooms,
      amenities: room.amenities || [],
      images: room.images || {}
    }));

    return NextResponse.json({ roomTypes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error?.message || "Unknown error" 
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    // Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract hotelId from route params
    const { hotelId } = await params;

    // Check if the hotel exists and belongs to the authenticated owner
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    if (hotel.ownerId !== userId) {
      return NextResponse.json({ 
        message: "Forbidden: You are not the owner of this hotel" 
      }, { status: 403 });
    }

    // Check content type to determine how to process the request
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle form data with images
      const formData = await request.formData();
      
      // Extract and validate form data
      const name = formData.get("name");
      const pricePerNightStr = formData.get("pricePerNight");
      const availableRoomsStr = formData.get("availableRooms");
      
      // Safely parse numeric values
      const pricePerNight = pricePerNightStr ? parseFloat(pricePerNightStr) : NaN;
      const availableRooms = availableRoomsStr ? parseInt(availableRoomsStr) : NaN;
      
      let amenities = [];
      
      try {
        const amenitiesStr = formData.get("amenities");
        if (amenitiesStr) {
          amenities = JSON.parse(amenitiesStr);
        }
      } catch (error) {
        console.error("Error parsing amenities:", error);
        return NextResponse.json({ 
          message: "Invalid amenities format. Must be JSON." 
        }, { status: 400 });
      }
      
      // Validate required fields
      if (!name || typeof name !== "string") {
        return NextResponse.json({ 
          message: "Room name must be a non-empty string" 
        }, { status: 400 });
      }
      
      if (isNaN(pricePerNight) || pricePerNight <= 0) {
        return NextResponse.json({ 
          message: "Price must be a number greater than 0" 
        }, { status: 400 });
      }
      
      if (isNaN(availableRooms) || availableRooms <= 0) {
        return NextResponse.json({ 
          message: "Available rooms must be a positive integer" 
        }, { status: 400 });
      }
      
      // Create room in database first to get roomId
      const newRoom = await prisma.room.create({
        data: {
          hotelId,
          type: name,
          pricePerNight,
          availableRooms,
          amenities
          // No description field in schema
        }
      });
      
      const roomId = newRoom.id;
      
      // Process and save images
      let savedImagePaths = {};
      try {
        for (const [key, value] of formData.entries()) {
          if (key.startsWith("image") && value instanceof Blob) {
            const arrayBuffer = await value.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);
            const imagePath = saveRoomImage(imageBuffer, hotelId, roomId, `${key}.png`);
            if (imagePath) {
              savedImagePaths[key] = imagePath;
            }
          }
        }
        
        // Update room with image paths
        if (Object.keys(savedImagePaths).length > 0) {
          await prisma.room.update({
            where: { id: roomId },
            data: {
              images: savedImagePaths
            }
          });
        }
      } catch (imageError) {
        console.error("Error processing images:", imageError);
        // Continue without images, don't fail the entire request
      }
      
      // Format response to match frontend expectations
      const roomType = {
        id: newRoom.id,
        name: newRoom.type,
        pricePerNight: newRoom.pricePerNight,
        availableRooms: newRoom.availableRooms,
        amenities: newRoom.amenities,
        images: savedImagePaths,
        capacity: 2 // Default capacity
      };
      
      return NextResponse.json({
        message: "Room type created successfully",
        roomType
      }, { status: 201 });
      
    } else {
      // Handle JSON request
      const data = await request.json();
      
      // Validate required fields
      if (!data.name) {
        return NextResponse.json({ 
          message: "Room type name is required" 
        }, { status: 400 });
      }
      
      if (isNaN(data.pricePerNight) || data.pricePerNight <= 0) {
        return NextResponse.json({ 
          message: "Valid price per night is required" 
        }, { status: 400 });
      }
      
      if (isNaN(data.availableRooms) || data.availableRooms < 0) {
        return NextResponse.json({ 
          message: "Available rooms must be a non-negative number" 
        }, { status: 400 });
      }
      
      // Create new room
      const newRoom = await prisma.room.create({
        data: {
          hotelId,
          type: data.name,
          pricePerNight: parseFloat(data.pricePerNight),
          availableRooms: parseInt(data.availableRooms),
          amenities: data.amenities || [],
          images: data.images || {}
        }
      });
      
      // Format response to match frontend expectations
      const roomType = {
        id: newRoom.id,
        name: newRoom.type,
        pricePerNight: newRoom.pricePerNight,
        availableRooms: newRoom.availableRooms,
        amenities: newRoom.amenities,
        images: newRoom.images,
        capacity: data.capacity || 2 // Default capacity
      };
      
      return NextResponse.json({
        message: "Room type created successfully",
        roomType
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating room type:", error?.message || "Unknown error");
    return NextResponse.json({
      message: "Internal Server Error",
      error: error?.message || "Unknown error occurred"
    }, { status: 500 });
  }
}