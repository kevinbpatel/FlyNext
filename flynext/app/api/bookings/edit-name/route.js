// app/api/bookings/cart/edit-name/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export async function PATCH(request) {
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

    const { bookingId, name } = data;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Valid name is required" },
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
        { error: "Can only edit names of pending bookings" },
        { status: 400 }
      );
    }

    // Update the booking name
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId
      },
      data: {
        name: name.trim()
      }
    });

    return NextResponse.json({
      message: "Booking name updated successfully",
      booking: updatedBooking
    });
  } catch (error) {
    console.error("Error updating booking name:", error);
    return NextResponse.json(
      { error: "Failed to update booking name", details: error.message },
      { status: 500 }
    );
  }
}