import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";
import { deleteRoomImage } from "@/utils/Images";
import { 
  checkHotelOwnership, 
  checkRoomAccess,
  validateRoomUpdates,
  calculateMaxBookedRooms,
  checkActiveBookings,
  formatRoomResponse,
  processRoomImages
} from "@/lib/rooms";

export async function GET(request, { params }) {
  try {
    // Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract params
    const { hotelId, roomId } = await params;

    // Check if the hotel exists and belongs to the authenticated owner
    const { hotel, error: hotelError } = await checkHotelOwnership(hotelId, userId);
    if (hotelError) {
      return NextResponse.json({ message: hotelError.message }, { status: hotelError.status });
    }

    // Fetch the specific room
    const room = await prisma.room.findUnique({
      where: { 
        id: roomId,
        hotelId: hotelId 
      },
      include: {
        bookingRooms: {
          include: { booking: true }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    // Format and return room data
    const roomType = formatRoomResponse(room, true);
    return NextResponse.json({ roomType }, { status: 200 });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract params
    const { hotelId, roomId } = await params;

    // Check room access
    const { room, error: roomError } = await checkRoomAccess(roomId, hotelId, userId, true);
    if (roomError) {
      return NextResponse.json({ message: roomError.message }, { status: roomError.status });
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      return NextResponse.json({
        message: "Error parsing form data",
        error: parseError.message
      }, { status: 400 });
    }

    // Create basic updates object with minimal fields
    const updates = {};
    
    // Handle name/type
    const name = formData.get("name") || formData.get("type");
    if (name) {
      updates.type = name;
    }
    
    // Handle price - convert to Decimal-compatible type
    const price = formData.get("price") || formData.get("pricePerNight");
    if (price) {
      try {
        // Convert to number, then to string for Prisma Decimal
        updates.pricePerNight = String(parseFloat(price));
      } catch (e) {
        return NextResponse.json({
          message: "Invalid price format"
        }, { status: 400 });
      }
    }
    
    // Handle availableRooms - with validation
    const availableRooms = formData.get("availableRooms");
    if (availableRooms) {
      try {
        const available = parseInt(availableRooms);
        
        if (isNaN(available)) {
          return NextResponse.json({ 
            message: "Available rooms must be a number" 
          }, { status: 400 });
        }
        
        if (available < 0) {
          return NextResponse.json({ 
            message: "Available rooms cannot be negative" 
          }, { status: 400 });
        }

        // Calculate maximum booked rooms
        const maxBooked = calculateMaxBookedRooms(room.bookingRooms || []);

        if (available < maxBooked) {
          return NextResponse.json({
            message: `Cannot set availableRooms to ${available}. The maximum confirmed bookings on a single day is ${maxBooked}. Please cancel bookings first.`,
          }, { status: 400 });
        }

        updates.availableRooms = available;
      } catch (e) {
        return NextResponse.json({
          message: "Invalid availableRooms format"
        }, { status: 400 });
      }
    }
    
    // Handle amenities
    const amenities = formData.get("amenities");
    if (amenities) {
      try {
        updates.amenities = JSON.parse(amenities);
      } catch (e) {
        return NextResponse.json({
          message: "Invalid amenities format"
        }, { status: 400 });
      }
    }
    
    // Handle image updates if present
    if (formData.has("image1") || formData.has("image2") || formData.has("image3")) {
      try {
        const updatedImages = await processRoomImages(formData, hotelId, roomId, room.images || {});
        if (Object.keys(updatedImages).length > 0) {
          updates.images = updatedImages;
        }
      } catch (imageError) {
        return NextResponse.json({
          message: "Error processing images",
          error: imageError.message
        }, { status: 500 });
      }
    }

    // Update Room in DB
    try {
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: updates,
      });

      const roomType = formatRoomResponse(updatedRoom);

      return NextResponse.json({
        message: "Room updated successfully",
        roomType
      }, { status: 200 });
    } catch (dbError) {
      return NextResponse.json({
        message: "Database error updating room",
        error: dbError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error.message
    }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    // Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract params
    const { hotelId, roomId } = await params;

    // Check room access
    const { room, error: roomError } = await checkRoomAccess(roomId, hotelId, userId, true);
    if (roomError) {
      return NextResponse.json({ message: roomError.message }, { status: roomError.status });
    }

    // Parse request data
    const data = await request.json();

    // Validate updates
    let { updates, errors } = validateRoomUpdates(data, room);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ 
        message: "Validation errors", 
        errors 
      }, { status: 400 });
    }

    // Handle availableRooms
    if (data.availableRooms !== undefined) {
      let available = parseInt(data.availableRooms);

      if (isNaN(available) || available < 0) {
        return NextResponse.json({ 
          message: "Available rooms cannot be negative" 
        }, { status: 400 });
      }

      // Calculate maximum booked rooms
      const maxBooked = calculateMaxBookedRooms(room.bookingRooms);

      if (available < maxBooked) {
        return NextResponse.json({
          message: `Cannot set availableRooms to ${available}. The maximum confirmed bookings on a single day is ${maxBooked}. Please cancel bookings first.`,
        }, { status: 400 });
      }

      updates.availableRooms = available;
    }

    // Update Room in DB
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: updates,
    });

    // Format response
    const roomType = formatRoomResponse(updatedRoom);

    return NextResponse.json({
      message: "Room updated successfully",
      roomType
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract params
    const { hotelId, roomId } = await params;

    // Check room access
    const { room, error: roomError } = await checkRoomAccess(roomId, hotelId, userId);
    if (roomError) {
      return NextResponse.json({ message: roomError.message }, { status: roomError.status });
    }

    // Check for active bookings
    const { hasActiveBookings, count } = await checkActiveBookings(roomId);
    if (hasActiveBookings) {
      return NextResponse.json({
        message: "Cannot delete room with active bookings. Please cancel bookings first.",
        activeBookings: count
      }, { status: 400 });
    }

    // Delete all booking room associations
    await prisma.bookingRoom.deleteMany({
      where: { roomId }
    });

    // Delete room images
    if (room.images && typeof room.images === 'object') {
      Object.values(room.images).forEach(path => {
        try {
          deleteRoomImage(path);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      });
    }

    // Delete the room
    await prisma.room.delete({
      where: { id: roomId }
    });

    return NextResponse.json({
      message: "Room deleted successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error.message 
    }, { status: 500 });
  }
}