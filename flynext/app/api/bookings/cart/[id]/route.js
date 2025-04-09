// app/api/bookings/cart/[id]/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export async function GET(request, context) {
  try {
    // Authenticate the user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract booking ID from params correctly - just await the params
    const params = await context.params;
    const bookingId = params.id;
    
    // Fetch the booking with its items
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        userId
      },
      include: {
        bookingFlights: true,
        bookingRooms: {
          include: {
            room: true
          }
        },
        hotel: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    // Calculate the number of nights for hotel bookings with check-in/check-out
    let nights = 0;
    if (booking.checkIn && booking.checkOut) {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }

    // Calculate hotel cost
    const hotelCost = booking.bookingRooms.reduce((total, bookingRoom) => {
      const roomPrice = parseFloat(bookingRoom.room.pricePerNight);
      return total + (roomPrice * bookingRoom.quantity * (nights || 1));
    }, 0);

    // Fetch detailed flight information for each bookingFlight
    const enrichedFlights = await Promise.all(
      booking.bookingFlights.map(async (bookingFlight) => {
        try {
          // Get detailed flight info from AFS API
          const response = await fetch(`https://advanced-flights-system.replit.app/api/flights/${bookingFlight.flightId}`, {
            headers: {
              "x-api-key": process.env.AFS_API_KEY,
            }
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`AFS API Error: ${error}`);
          }

          const flightData = await response.json();
          
          // Return the booking flight with enriched details
          return {
            ...bookingFlight,
            flightDetails: {
              flightNumber: flightData.flightNumber,
              airline: flightData.airline.name,
              origin: flightData.origin.code,
              destination: flightData.destination.code,
              departureTime: flightData.departureTime,
              arrivalTime: flightData.arrivalTime,
              price: flightData.price,
              availableSeats: flightData.availableSeats,
              status: flightData.status,
              originDetails: flightData.origin,
              destinationDetails: flightData.destination,
              airlineDetails: flightData.airline
            }
          };
        } catch (error) {
          console.error(`Error fetching flight details for ${bookingFlight.flightId}:`, error);
          // Return the original booking flight with error info
          return {
            ...bookingFlight,
            flightDetails: { error: error.message }
          };
        }
      })
    );

    // Enrich booking with additional information
    const enrichedBooking = {
      ...booking,
      name: booking.name || 'Untitled Booking', // Ensure name is included
      nights: nights,
      hotelCost: hotelCost,
      flightCost: parseFloat(booking.totalPrice) - hotelCost,
      bookingFlights: enrichedFlights // Replace with enriched flights
    };

    return NextResponse.json({
      booking: enrichedBooking
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart", details: error.message },
      { status: 500 }
    );
  }
}