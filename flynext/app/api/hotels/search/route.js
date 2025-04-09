// app/api/hotels/search/route.js
import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET(req) {
  try {
    // Step 1: Extract and validate query parameters
    const url = new URL(req.url);
    const city = url.searchParams.get("city");
    const checkIn = url.searchParams.get("checkIn");
    const checkOut = url.searchParams.get("checkOut");
    const name = url.searchParams.get("name") || null;

    const minPrice = parseFloat(url.searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(url.searchParams.get("maxPrice")) || Number.MAX_VALUE;
    const minStarRating = parseInt(url.searchParams.get("minStarRating")) || 1;
    const maxStarRating = parseInt(url.searchParams.get("maxStarRating")) || 5;

    // Step 2: Validate required fields
    if (!city || typeof city !== "string") {
      return NextResponse.json({ message: "Invalid or missing city name" }, { status: 400 });
    }

    // Add date validation back from original version
    if (!checkIn || !checkOut) {
      return NextResponse.json({ message: "Check-in and check-out dates are required" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
      return NextResponse.json({ message: "Invalid check-in or check-out date" }, { status: 400 });
    }

    // Step 3: Validate numeric filters
    if (isNaN(minStarRating) || minStarRating < 1 || minStarRating > 5) {
      return NextResponse.json({ message: "Invalid minStarRating (must be 1-5)" }, { status: 400 });
    }

    if (isNaN(maxStarRating) || maxStarRating < 1 || maxStarRating > 5) {
      return NextResponse.json({ message: "Invalid maxStarRating (must be 1-5)" }, { status: 400 });
    }

    if (isNaN(minPrice) || minPrice < 0) {
      return NextResponse.json({ message: "Invalid minPrice (must be a positive number)" }, { status: 400 });
    }

    if (isNaN(maxPrice) || maxPrice < minPrice) {
      return NextResponse.json({ message: "Invalid maxPrice (must be greater than minPrice)" }, { status: 400 });
    }

    // Step 4: Query hotels with filters and include booking information
    const hotels = await prisma.hotel.findMany({
      where: {
        city: { name: city },
        starRating: { gte: minStarRating, lte: maxStarRating },
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
      include: {
        rooms: {
          where: {
            pricePerNight: { gte: minPrice, lte: maxPrice },
          },
          include: {
            bookingRooms: {
              include: {
                booking: true, // Fetch booking details for availability check
              },
            },
          },
        },
        city: true,
      },
    });

    // Step 5: Filter hotels with available rooms during requested dates
    const availableHotels = hotels
      .map((hotel) => {
        // Filter to only include rooms that are available for the requested dates
        const availableRooms = hotel.rooms.filter((room) => {
          // Count overlapping bookings
          let totalBooked = 0;

          room.bookingRooms
            .filter((bookingRoom) => bookingRoom.booking?.status === "confirmed")
            .forEach((bookingRoom) => {
              const bookingStart = new Date(bookingRoom.booking.checkIn);
              const bookingEnd = new Date(bookingRoom.booking.checkOut);

              if (checkInDate < bookingEnd && checkOutDate > bookingStart) {
                totalBooked += bookingRoom.quantity;
              }
            });

          // Room is available if total bookings do not exceed available rooms
          return totalBooked < room.availableRooms;
        });

        // Only include hotels with at least one available room
        return availableRooms.length > 0 ? { ...hotel, availableRooms } : null;
      })
      .filter(Boolean); // Remove hotels with no available rooms

    // Step 6: Format response using the improved formatting from the simplified version
    const formattedHotels = availableHotels.map((hotel) => {
      // Find the cheapest available room for starting price
      const startingPrice = hotel.availableRooms.length > 0
        ? Math.min(...hotel.availableRooms.map(room => room.pricePerNight))
        : null;

      // Parse the address JSON
      const addressData = typeof hotel.address === 'string'
        ? JSON.parse(hotel.address)
        : hotel.address;

      return {
        id: hotel.id,
        name: hotel.name,
        logo: hotel.logo || '/hotel-logos/default.png', // Fallback for missing logos
        address: {
          street: addressData.street || '',
          postalCode: addressData.postalCode || '',
          city: hotel.city?.name || addressData.city || '',
          country: addressData.country || '',
        },
        starRating: hotel.starRating,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        images: hotel.images || {},
        price: startingPrice,
        cityId: hotel.cityId,
        ownerId: hotel.ownerId,
        createdAt: hotel.createdAt?.toISOString(),
        updatedAt: hotel.updatedAt?.toISOString(),
      };
    });

    return NextResponse.json({ hotels: formattedHotels }, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}