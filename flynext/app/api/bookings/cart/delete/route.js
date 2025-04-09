// app/api/bookings/cart/delete/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export async function DELETE(request) {
  try {
    // Authenticate the user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { bookingId } = data;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Verify the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Can only delete pending bookings" },
        { status: 400 }
      );
    }

    // Delete all associated data in a transaction
    await prisma.$transaction(async (prisma) => {
      // Delete booking flights
      await prisma.bookingFlight.deleteMany({
        where: {
          bookingId
        }
      });

      // Delete booking rooms
      await prisma.bookingRoom.deleteMany({
        where: {
          bookingId
        }
      });

      // Delete the booking itself
      await prisma.booking.delete({
        where: {
          id: bookingId
        }
      });
    });

    return NextResponse.json({
      message: "Booking and all associated items deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    
    // Check for Prisma "not found" errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Booking not found or already deleted" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete booking", details: error.message },
      { status: 500 }
    );
  }
}