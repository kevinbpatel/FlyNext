import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET(req) {
  try {
    // ✅ Step 1: Extract and validate query parameters
    const url = new URL(req.url);
    const hotelId = url.searchParams.get("hotelId");
    const checkIn = url.searchParams.get("checkIn");
    const checkOut = url.searchParams.get("checkOut");
    
    if (!hotelId) {
      return NextResponse.json({ message: "Hotel ID is required" }, { status: 400 });
    }
    
    if (!checkIn || !checkOut) {
      return NextResponse.json({ message: "Check-in and check-out dates are required" }, { status: 400 });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
      return NextResponse.json({ message: "Invalid check-in or check-out date" }, { status: 400 });
    }
    
    // ✅ Step 2: Fetch hotel details along with its rooms and bookings
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        rooms: {
          include: {
            bookingRooms: {
              include: {
                booking: true, // Fetch booking details
              },
            },
          },
        },
      },
    });
    
    if (!hotel) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }
    
    // ✅ Step 3: Process room availability
    const formattedRooms = hotel.rooms.map((room) => {
      let totalBookedDuringRange = 0;
      
      // ✅ Count the number of rooms booked in the selected date range
      room.bookingRooms
        .filter((bookingRoom) => bookingRoom.booking?.status === "confirmed")
        .forEach((bookingRoom) => {
          const bookingStart = new Date(bookingRoom.booking.checkIn);
          const bookingEnd = new Date(bookingRoom.booking.checkOut);
          
          if (checkInDate < bookingEnd && checkOutDate > bookingStart) {
            totalBookedDuringRange += bookingRoom.quantity;
          }
        });
      
      // ✅ Calculate available rooms
      const availableRooms = room.availableRooms - totalBookedDuringRange;
      
      // ✅ Ensure all numeric values are proper numbers, not strings
      return {
        id: room.id,
        type: room.type,
        // Convert pricePerNight to number to prevent frontend issues
        pricePerNight: Number(room.pricePerNight),
        amenities: room.amenities || [],
        totalRooms: Number(room.availableRooms),
        availableRooms: Math.max(0, Number(availableRooms)), // Ensuring no negative values
        images: room.images ? Object.values(room.images) : [], // Fetch room images
        capacity: Number(room.capacity || 2) // Default to 2 if not specified
      };
    });
    
    // ✅ Step 4: Prepare the final response
    const response = {
      id: hotel.id,
      logo: hotel.logo,
      name: hotel.name,
      starRating: Number(hotel.starRating),
      address: hotel.address,
      images: hotel.images ? Object.values(hotel.images) : [], // Fetch hotel images
      rooms: formattedRooms,
    };
    
    return NextResponse.json({ hotel: response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotel details:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}