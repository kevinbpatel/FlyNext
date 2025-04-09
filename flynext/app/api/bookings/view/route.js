// app/api/bookings/view/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export async function GET(request) {
  /*
    USER STORY FROM PROJECT DESCRIPTION:
    As a user, I want to view my bookings, so that I can easily access my 
    itinerary and booking information.
  */
  
  try {
    // 1. Authenticate user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // 2. We'll retrieve all bookings for the user without filtering
    const where = { userId };
    
    // 3. Retrieve all bookings for the user from the DB
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        createdAt: 'desc',  // Most recent bookings first
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            starRating: true,
            address: true,
          }
        },
        bookingRooms: {
          include: {
            room: {
              select: {
                id: true,
                type: true,
                pricePerNight: true,
                amenities: true,
              }
            }
          }
        },
        bookingFlights: {
          select: {
            id: true,
            flightId: true,
            bookingReference: true,
          }
        }
      }
    });
    
    // 4. Enrich bookings with additional information
    const enrichedBookings = bookings.map(booking => {
      // Calculate the number of nights for hotel bookings with check-in/check-out
      let nights = 0;
      if (booking.checkIn && booking.checkOut) {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      }
      
      // Calculate hotel cost from booking rooms
      const hotelCost = booking.bookingRooms.reduce((total, bookingRoom) => {
        const roomPrice = parseFloat(bookingRoom.room.pricePerNight);
        return total + (roomPrice * bookingRoom.quantity * (nights || 1));
      }, 0);
      
      // Prepare flight information
      const flights = booking.bookingFlights.map(flight => ({
        id: flight.id,
        flightId: flight.flightId,
        bookingReference: flight.bookingReference || "N/A",
      }));
      
      // Prepare hotel information
      const hotelInfo = booking.hotel ? {
        id: booking.hotel.id,
        name: booking.hotel.name,
        starRating: booking.hotel.starRating,
        address: booking.hotel.address,
      } : null;
      
      // Prepare rooms information
      const rooms = booking.bookingRooms.map(bookingRoom => ({
        id: bookingRoom.id,
        type: bookingRoom.room.type,
        quantity: bookingRoom.quantity,
        pricePerNight: bookingRoom.room.pricePerNight,
        amenities: bookingRoom.room.amenities,
        totalPrice: parseFloat(bookingRoom.room.pricePerNight) * bookingRoom.quantity * (nights || 1),
      }));
      
      // Return enriched booking - now with name included
      return {
        id: booking.id,
        name: booking.name || 'Untitled Booking', // Added name with fallback
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: nights,
        totalPrice: parseFloat(booking.totalPrice),
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        hotel: hotelInfo,
        rooms: rooms,
        flights: flights,
        hotelCost: hotelCost,
        flightCost: parseFloat(booking.totalPrice) - hotelCost,
      };
    });
    
    // 5. Return the bookings
    return NextResponse.json({
      bookings: enrichedBookings
    });
    
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}