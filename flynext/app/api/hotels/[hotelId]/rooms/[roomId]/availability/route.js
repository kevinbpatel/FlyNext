// /app/api/hotels/[hotelId]/rooms/[roomId]/availability/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth"; // Authentication function
import prisma from "@/utils/db";

export async function GET(req, { params }) {
  /*
    USER STORY FROM PROJECT DESCRIPTION:
    "As a hotel owner, I want to view room availability (per room type) for 
    specific date ranges to better understand occupancy trends."
  */
  try {
    // Step 1: Authenticate user
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Extract path parameters and query parameters
    const { hotelId, roomId } = await params; // Extract from URL path
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const specificDateParam = url.searchParams.get("date");

    // Validate required parameters
    if (!hotelId || !roomId) {
      return NextResponse.json({ message: "Hotel ID and Room ID are required" }, { status: 400 });
    }

    let startDate = null, endDate = null;
    if (specificDateParam) {
      // Single Date Mode
      startDate = new Date(specificDateParam);
      endDate = new Date(specificDateParam);
    } else if (startDateParam && endDateParam) {
      // Date Range Mode
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      return NextResponse.json({ message: "Provide either a single date or a start and end date." }, { status: 400 });
    }

    // Validate dates
    if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) {
      return NextResponse.json({ message: "Invalid date range" }, { status: 400 });
    }

    // Step 3: Fetch room and ensure user owns the hotel
    const room = await prisma.room.findUnique({
      where: { 
        id: roomId,
        hotelId: hotelId // Add hotel ID constraint
      },
      include: { hotel: true }, // Include hotel info to verify ownership
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    if (room.hotel.ownerId !== userId) {
      return NextResponse.json({ message: "Forbidden: You are not the owner of this hotel" }, { status: 403 });
    }

    // Step 4: Fetch all confirmed bookings for the room within the given date range
    const bookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
        bookingRooms: {
          some: { roomId },
        },
        checkIn: { lt: endDate }, // Check-in must be before end date
        checkOut: { gt: startDate }, // Check-out must be after start date
      },
      include: {
        bookingRooms: { where: { roomId } }, // Only fetch rooms for this booking that match `roomId`
      },
    });

    // Step 5: Calculate daily availability for each day in the range
    let dailyAvailability = {};
    
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dayKey = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
      
      let totalBookedRooms = 0;
      let dailyBookings = [];

      bookings.forEach((booking) => {
        const bookingStart = new Date(booking.checkIn);
        const bookingEnd = new Date(booking.checkOut);

        if (bookingStart <= currentDate && bookingEnd > currentDate) {
          // This booking affects this specific date
          const bookingRoom = booking.bookingRooms.find((br) => br.roomId === roomId);
          totalBookedRooms += bookingRoom.quantity;

          dailyBookings.push({
            bookingId: booking.id,
            checkInDate: booking.checkIn,
            checkOutDate: booking.checkOut,
            quantity: bookingRoom.quantity,
          });
        }
      });

      dailyAvailability[dayKey] = {
        date: dayKey,
        totalRooms: room.availableRooms,
        bookedRooms: totalBookedRooms,
        availableRooms: room.availableRooms - totalBookedRooms,
        bookings: dailyBookings,
      };
    }

    // Step 6: Return response
    return NextResponse.json({
      message: "Room availability fetched successfully",
      room: {
        id: room.id,
        type: room.type,
        totalRooms: room.availableRooms,
        availability: dailyAvailability, // Daily room availability & bookings
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching room availability:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}