// scripts/seed-locations.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database.");
        
    // Prepare API details
    const apiKey = process.env.AFS_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error("Missing AFS_API_KEY in .env");
    }
    const baseUrl = "https://advanced-flights-system.replit.app/api";
    
    // Check API connection before doing anything else
    console.log("Checking API connectivity...");
    
    const testResponse = await fetch(`${baseUrl}/cities`, {
      headers: { "x-api-key": apiKey }
    });
    
    if (!testResponse.ok) {
      throw new Error(`API check failed: ${testResponse.status} ${testResponse.statusText}. Please ensure Your AFS_API_KEY in .env was pasted correctly`);
    }
    
    // Seed cities
    console.log("Start seeding cities");
    const citiesResponse = await fetch(`${baseUrl}/cities`, {
      headers: { "x-api-key": apiKey }
    });
    const citiesData = await citiesResponse.json();
    
    // Log cities to debug
    console.log(`Received ${citiesData.length} cities from API`);
    
    // Map to the format expected by Prisma
    const cityRecords = citiesData.map(c => ({
      name: c.city,
      country: c.country
    }));
    
    // Create cities
    await prisma.city.createMany({ data: cityRecords });
    console.log(`Inserted ${cityRecords.length} cities.`);
    
    // Seed airports
    console.log("Start seeding airports");
    const allCities = await prisma.city.findMany();
    const cityIdMap = new Map(
      allCities.map(city => [`${city.name}-${city.country}`, city.id])
    );
    
    const airportsResponse = await fetch(`${baseUrl}/airports`, {
      headers: { "x-api-key": apiKey }
    });
    const airportsData = await airportsResponse.json();
    
    const airportRecords = airportsData
      .filter(a => cityIdMap.has(`${a.city}-${a.country}`)) // Only use airports with matching cities
      .map(a => ({
        name: a.name,
        code: a.code,
        cityId: cityIdMap.get(`${a.city}-${a.country}`)
      }));
    
    await prisma.airport.createMany({ data: airportRecords });
    console.log(`Inserted ${airportRecords.length} airports.`);
    
    console.log("City and airport seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);  // Exit with failure code to indicate the seed did not complete
  } finally {
    // Disconnect from the database in all cases
    await prisma.$disconnect();
  }
}

// Execute the seeding function
main();