// app/api/flights/autocomplete/route.js
import prisma from "@/utils/db"; // your prisma instance
import { NextResponse } from "next/server";

/**
 * Calculates a relevance score for search results based on how well they match the search term
 * Lower score = better match
 */
function calculateRelevanceScore(itemName, searchTerm) {
  const normalizedItem = itemName.toLowerCase();
  const normalizedSearch = searchTerm.toLowerCase();
  
  // Exact match gets highest priority
  if (normalizedItem === normalizedSearch) {
    return 0;
  }
  
  // Starts with match gets second priority
  if (normalizedItem.startsWith(normalizedSearch)) {
    return 1;
  }
  
  // Contains match gets third priority
  if (normalizedItem.includes(normalizedSearch)) {
    // Calculate position - earlier matches are better
    const position = normalizedItem.indexOf(normalizedSearch);
    return 2 + (position / 100); // Add a small fraction to rank earlier positions higher
  }
  
  // Word boundary match gets fourth priority
  const words = normalizedItem.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (words[i].startsWith(normalizedSearch)) {
      return 3 + (i / 100); // Add word position for secondary sorting
    }
  }
  
  // Least relevant - sort lexicographically
  return 10; 
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    
    // If there's no query or it's empty, return empty suggestions
    if (!query || query.trim() === '') {
      return NextResponse.json({ suggestions: { cities: [], airports: [] } });
    }
    
    // Clean up the search term
    const searchTerm = query.trim();
    
    // Find cities using our Prisma model
    const cities = await prisma.city.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: searchTerm,
              mode: 'insensitive',
            }
          },
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        country: true,
      },
      take: 20, // Get more results than needed for better sorting
    });
    
    // Find airports using our Prisma model with code matches as highest priority
    const airports = await prisma.airport.findMany({
      where: {
        OR: [
          // First priority: code matches
          {
            code: {
              startsWith: searchTerm,
              mode: 'insensitive',
            }
          },
          {
            code: {
              equals: searchTerm,
              mode: 'insensitive',
            }
          },
          // Second priority: name matches
          {
            name: {
              startsWith: searchTerm,
              mode: 'insensitive',
            }
          },
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        code: true,
        city: {
          select: {
            name: true
          }
        }
      },
      take: 20, // Get more results than needed for better sorting
    });
    
    // Score and sort cities by relevance
    const scoredCities = cities.map(city => ({
      ...city,
      relevanceScore: calculateRelevanceScore(city.name, searchTerm)
    }));
    
    // Sort cities by relevance score
    const sortedCities = scoredCities
      .sort((a, b) => a.relevanceScore - b.relevanceScore)
      .slice(0, 5); // Return only top 5
    
    // Score and sort airports by relevance
    const scoredAirports = airports.map(airport => {
      // Special handling for code matches (highest priority)
      let relevanceScore = 100;
      
      // Exact code match (highest priority)
      if (airport.code.toLowerCase() === searchTerm.toLowerCase()) {
        relevanceScore = -1;
      }
      // Code starts with search term (second highest)
      else if (airport.code.toLowerCase().startsWith(searchTerm.toLowerCase())) {
        relevanceScore = 0;
      }
      // Otherwise score based on name
      else {
        relevanceScore = calculateRelevanceScore(airport.name, searchTerm);
      }
      
      return {
        ...airport,
        relevanceScore
      };
    });
    
    // Sort airports by relevance score
    const sortedAirports = scoredAirports
      .sort((a, b) => a.relevanceScore - b.relevanceScore)
      .slice(0, 5); // Return only top 5
    
    // Format the results, removing the calculated score
    const formattedCities = sortedCities.map(({ id, name, country, relevanceScore, ...rest }) => ({
      name,
      country
    }));
    
    const formattedAirports = sortedAirports.map(({ id, name, code, city, relevanceScore, ...rest }) => ({
      name,
      code,
      cityName: city?.name
    }));
    
    // Return the combined results
    return NextResponse.json({
      suggestions: {
        cities: formattedCities,
        airports: formattedAirports
      }
    });
    
  } catch (error) {
    console.error("Error in autocomplete API:", error);
    return NextResponse.json(
      { 
        error: error.message, 
        suggestions: { cities: [], airports: [] } 
      }, 
      { status: 500 }
    );
  }
}