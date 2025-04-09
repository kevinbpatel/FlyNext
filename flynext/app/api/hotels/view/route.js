// app/api/hotels/view/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth"; // Authentication function
import prisma from "@/utils/db";

export async function GET(req) {
  try {
    // ✅ Step 1: Authenticate user
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // ✅ Step 2: Fetch hotels owned by the user
    const hotels = await prisma.hotel.findMany({
      where: { ownerId: userId },
      include: {
        rooms: {
          select: {
            id: true,
            type: true,
            pricePerNight: true,
            availableRooms: true,
            bookingRooms: {
              select: {
                booking: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (!hotels || hotels.length === 0) {
      return NextResponse.json({ message: "No hotels found for this owner" }, { status: 404 });
    }
    
    // ✅ Step 3: Format response (Include booking count, exclude large images)
    const formattedHotels = hotels.map((hotel) => {
      // Count confirmed bookings across all rooms
      let bookingCount = 0;
      hotel.rooms.forEach((room) => {
        bookingCount += room.bookingRooms.filter(
          (bookingRoom) => bookingRoom.booking?.status === "confirmed"
        ).length;
      });
      
      return {
        id: hotel.id,
        name: hotel.name,
        logo: hotel.logo,
        starRating: hotel.starRating,
        address: hotel.address,
        cityId: hotel.cityId,
        // Include geographic data for mapping
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        rooms: hotel.rooms.map(({ bookingRooms, ...roomData }) => roomData), // Remove bookingRooms from rooms
        bookingCount, // ✅ New: Total confirmed bookings count
        images: hotel.images ? Object.keys(hotel.images) : [],
      };
    });
    
    return NextResponse.json({ hotels: formattedHotels }, { status: 200 });
   
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}