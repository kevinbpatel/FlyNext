import { PrismaClient } from "@prisma/client";
import { createToken, createRefreshToken, authenticate_refresh } from "../../../../utils/auth.js"; // Import token functions

const prisma = new PrismaClient();
export async function POST(request) {
  try {
    // Parse JSON from the request body
    const { refreshToken } = await request.json()
    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token is required" }, { status: 400 })
    }

    // Authenticate user with refresh token
    const userId = await authenticate_refresh(refreshToken)
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Delete old refresh token from DB
    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    // Generate new access & refresh tokens
    const accessToken = createToken(userId)
    const newRefreshToken = createRefreshToken(userId)

    // Store the new refresh token in the database
    await prisma.refreshToken.create({
      data: {
        userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return NextResponse.json({ accessToken, refreshToken: newRefreshToken })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
