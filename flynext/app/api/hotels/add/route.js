import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";
import { saveHotelImage } from "@/utils/Images";
import { Buffer } from "buffer";

// Add a geocoding function - using OpenStreetMap Nominatim API
async function geocodeAddress(address) {
  try {
    const { street, city, postalCode, country } = address;
    
    // Format 1: Try full address with commas
    const query1 = encodeURIComponent(`${street}, ${city}, ${postalCode}, ${country}`);
    console.log("Trying query format 1:", query1);
    
    // Using OpenStreetMap Nominatim API with proper headers
    const response1 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query1}&limit=1`, {
      headers: {
        // This header is required by Nominatim's usage policy
        'User-Agent': 'HotelBookingApp/1.0'
      }
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log("Response data format 1:", data1);
      
      if (data1.length > 0) {
        return {
          latitude: parseFloat(data1[0].lat),
          longitude: parseFloat(data1[0].lon)
        };
      }
    }
    
    // Format 2: Try with only city and country (as fallback)
    const query2 = encodeURIComponent(`${city}, ${country}`);
    console.log("Trying query format 2:", query2);
    
    const response2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query2}&limit=1`, {
      headers: {
        'User-Agent': 'HotelBookingApp/1.0'
      }
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log("Response data format 2:", data2);
      
      if (data2.length > 0) {
        return {
          latitude: parseFloat(data2[0].lat),
          longitude: parseFloat(data2[0].lon)
        };
      }
    }
    
    // Debug log - useful to see what's happening
    console.error("No results from geocoding service for address:", address);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function POST(req) {
  try {
    // ✅ Step 1: Authenticate user
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Step 2: Parse multipart/form-data
    const formData = await req.formData();

    let name = formData.get("name");
    let logo = formData.get("logo"); // Logo file
    let address = formData.get("address");
    let starRating = parseInt(formData.get("starRating"));
    let ownerId = userId; // Owner is authenticated user

    // ✅ Step 3: Validate & Parse Inputs
    try {
      address = JSON.parse(address);
    } catch (error) {
      return NextResponse.json({ message: "Invalid address format" }, { status: 400 });
    }

    if (!name || !address || !starRating) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (starRating < 1 || starRating > 5) {
      return NextResponse.json({ message: "Star rating must be between 1 and 5" }, { status: 400 });
    }

    if (!address.street || !address.postalCode || !address.city || !address.country) {
      return NextResponse.json(
        { message: "Invalid address format. Must include street, postalCode, city, and country." },
        { status: 400 }
      );
    }

    // ✅ Step 4: Check if city exists
    const cityRecord = await prisma.city.findFirst({
      where: { name: address.city, country: address.country },
    });

    if (!cityRecord) {
      return NextResponse.json({ message: "City not found or incorrect country." }, { status: 404 });
    }

    // ✅ NEW STEP: Geocode the address
    const geocodingResult = await geocodeAddress(address);
    
    if (!geocodingResult) {
      return NextResponse.json({ 
        message: "Unable to validate address location. Please check the address and try again." 
      }, { status: 400 });
    }

    // ✅ Step 5: Create Hotel in Database with geocoded coordinates
    const newHotel = await prisma.hotel.create({
      data: {
        name,
        address,
        cityId: cityRecord.id,
        starRating,
        ownerId,
        latitude: geocodingResult.latitude,
        longitude: geocodingResult.longitude
      },
    });

    const hotelId = newHotel.id; // Get the newly created hotel's ID

    // ✅ Step 6: Process Logo (if provided)
    let logoPath = '';
    if (logo instanceof Blob) {
      const arrayBuffer = await logo.arrayBuffer();
      const logoBuffer = Buffer.from(arrayBuffer);
      logoPath = saveHotelImage(logoBuffer, hotelId, "logo.png");
    }

    // ✅ Step 7: Process and Save Images (`image1`, `image2`, etc.)
    let savedImagePaths = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image") && value instanceof Blob) {
        const arrayBuffer = await value.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const imagePath = saveHotelImage(imageBuffer, hotelId, `${key}.png`);
        if (imagePath) {
          savedImagePaths[key] = imagePath;
        }
      }
    }

    // ✅ Step 8: Update Hotel with Image Paths
    await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        logo: logoPath,
        images: savedImagePaths,
      },
    });

    return NextResponse.json({
      message: "Hotel created successfully",
      hotel: {
        id: newHotel.id,
        name: newHotel.name,
        starRating: newHotel.starRating,
        address: newHotel.address,
        cityId: newHotel.cityId,
        ownerId: newHotel.ownerId,
        latitude: newHotel.latitude,
        longitude: newHotel.longitude,
        logo: logoPath,
        images: savedImagePaths,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}