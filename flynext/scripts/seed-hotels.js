// scripts/seed-hotels.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const bcrypt = require('bcrypt');

// Import seed data
const { 
  hotelOwners, 
  roomTypes, 
  torontoHotels, 
  tokyoHotels,
  profileImages,
  imageUrls
} = require('./seed-data');

const prisma = new PrismaClient();

// Find project root directory (one level up from scripts)
const projectRoot = path.resolve(__dirname, '..');
console.log(`Project root directory: ${projectRoot}`);

// Tracking request completions
let activeRequests = 0;

// Function to download an image from a URL with proper User-Agent
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    activeRequests++;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        activeRequests--; // Decrement before redirecting
        return downloadImage(response.headers.location)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        activeRequests--;
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        activeRequests--;
        resolve(Buffer.concat(chunks));
      });
      response.on('error', (err) => {
        activeRequests--;
        reject(err);
      });
    });

    req.on('error', (err) => {
      activeRequests--;
      reject(err);
    });
    
    // Set a timeout on the request
    req.setTimeout(10000, () => {
      activeRequests--;
      req.abort();
      reject(new Error('Request timed out'));
    });
  });
}

// Image handling functions - using project root instead of process.cwd()
function saveHotelImage(imageBuffer, hotelId, fileName) {
  try {
    const hotelImageDir = path.join(projectRoot, "public", "upload", "hotel", hotelId, "images");
    if (!fs.existsSync(hotelImageDir)) {
      fs.mkdirSync(hotelImageDir, { recursive: true });
    }
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;
    const filePath = path.join(hotelImageDir, uniqueFileName);
    fs.writeFileSync(filePath, imageBuffer);
    return `/upload/hotel/${hotelId}/images/${uniqueFileName}`;
  } catch (error) {
    console.error("Error saving hotel image:", error);
    return null;
  }
}

function saveRoomImage(imageBuffer, hotelId, roomId, fileName) {
  try {
    const roomImageDir = path.join(projectRoot, "public", "upload", "hotel", hotelId, "rooms", roomId, "images");
    if (!fs.existsSync(roomImageDir)) {
      fs.mkdirSync(roomImageDir, { recursive: true });
    }
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;
    const filePath = path.join(roomImageDir, uniqueFileName);
    fs.writeFileSync(filePath, imageBuffer);
    return `/upload/hotel/${hotelId}/rooms/${roomId}/images/${uniqueFileName}`;
  } catch (error) {
    console.error("Error saving room image:", error);
    return null;
  }
}

function saveProfileImage(imageBuffer, userId, fileName) {
  try {
    const profileImageDir = path.join(projectRoot, "public", "upload", "user", userId, "profile");
    if (!fs.existsSync(profileImageDir)) {
      fs.mkdirSync(profileImageDir, { recursive: true });
    }
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;
    const filePath = path.join(profileImageDir, uniqueFileName);
    fs.writeFileSync(filePath, imageBuffer);
    return `/upload/user/${userId}/profile/${uniqueFileName}`;
  } catch (error) {
    console.error("Error saving profile image:", error);
    return null;
  }
}

// Helper functions
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomAvailableRooms() {
  return Math.floor(Math.random() * 10) + 1;
}

async function main() {
  try {
    console.log("Starting hotel seeding process...");
    
    // Connect to database
    await prisma.$connect();
        
    // Create users first
    console.log("Creating hotel owner users...");
    const createdUsers = [];
    for (let i = 0; i < hotelOwners.length; i++) {
      const owner = hotelOwners[i];
      const passwordHash = bcrypt.hashSync(owner.password, 10);
      const user = await prisma.user.create({
        data: {
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          passwordHash,
          phone: owner.phone
        }
      });
      
      try {
        const profileImageUrl = profileImages[i % profileImages.length];
        console.log(`Downloading profile image from ${profileImageUrl}`);
        const imageBuffer = await downloadImage(profileImageUrl);
        const profilePicturePath = saveProfileImage(imageBuffer, user.id, "profile.jpg");
        
        // Only update if profile picture path was successfully created
        if (profilePicturePath) {
          await prisma.user.update({
            where: { id: user.id },
            data: { profilePicture: profilePicturePath }
          });
          console.log(`Added profile picture for ${user.firstName} ${user.lastName}`);
        }
      } catch (error) {
        console.error(`Failed to download profile picture for ${owner.email}:`, error);
      }
      
      createdUsers.push(user);
      console.log(`Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    }
    
    // Find Toronto and Tokyo cities - ensure they exist with direct creation if needed
    let toronto = await prisma.city.findFirst({
      where: { name: "Toronto", country: "Canada" }
    });
    
    if (!toronto) {
      console.log("Toronto city not found, creating it directly");
      toronto = await prisma.city.create({
        data: { name: "Toronto", country: "Canada" }
      });
      console.log("Toronto city created directly");
    }
    
    let tokyo = await prisma.city.findFirst({
      where: { name: "Tokyo", country: "Japan" }
    });
    
    if (!tokyo) {
      console.log("Tokyo city not found, creating it directly");
      tokyo = await prisma.city.create({
        data: { name: "Tokyo", country: "Japan" }
      });
      console.log("Tokyo city created directly");
    }
    
    console.log("Found/created city records for Toronto and Tokyo");
    
    // Combine all hotels
    const allHotels = [
      ...torontoHotels.map(hotel => ({ ...hotel, cityId: toronto.id })),
      ...tokyoHotels.map(hotel => ({ ...hotel, cityId: tokyo.id }))
    ];
    
    console.log(`Creating ${allHotels.length} hotels...`);
    console.log(`Toronto hotels: ${torontoHotels.length}, Tokyo hotels: ${tokyoHotels.length}`);
    
    // Create hotels
    for (const [index, hotelData] of allHotels.entries()) {
      const randomOwnerIndex = index % createdUsers.length;
      const ownerId = createdUsers[randomOwnerIndex].id;
      const hotel = await prisma.hotel.create({
        data: {
          name: hotelData.name,
          address: hotelData.address,
          cityId: hotelData.cityId,
          starRating: hotelData.starRating,
          ownerId,
          latitude: hotelData.latitude,
          longitude: hotelData.longitude,
          images: {}
        }
      });
      console.log(`Created hotel: ${hotel.name}`);
      
      try {
        // Use a random image for logo
        const logoImageUrl = imageUrls[index % imageUrls.length];
        console.log(`Downloading logo image from ${logoImageUrl}`);
        const logoBuffer = await downloadImage(logoImageUrl);
        const logoPath = saveHotelImage(logoBuffer, hotel.id, "logo.jpg");
        
        // Use random images for hotel
        const hotelImagesObj = {};
        for (let i = 0; i < 4; i++) {
          const imageUrl = imageUrls[(index + i) % imageUrls.length];
          console.log(`Downloading hotel image from ${imageUrl}`);
          const imageBuffer = await downloadImage(imageUrl);
          const imagePath = saveHotelImage(imageBuffer, hotel.id, `image${i + 1}.jpg`);
          hotelImagesObj[`image${i + 1}`] = imagePath;
        }
        
        await prisma.hotel.update({
          where: { id: hotel.id },
          data: {
            logo: logoPath,
            images: hotelImagesObj
          }
        });
        console.log(`Added logo and ${Object.keys(hotelImagesObj).length} images to hotel: ${hotel.name}`);
        
        // Create 2-3 room types per hotel to save time
        const numRoomTypes = Math.floor(Math.random() * 2) + 2; // 2-3 room types
        console.log(`Creating ${numRoomTypes} room types for hotel: ${hotel.name}`);
        for (let i = 0; i < numRoomTypes; i++) {
          const roomTypeData = roomTypes[i % roomTypes.length];
          const pricePerNight = getRandomPrice(roomTypeData.priceRange.min, roomTypeData.priceRange.max);
          const availableRooms = getRandomAvailableRooms();
          const room = await prisma.room.create({
            data: {
              hotelId: hotel.id,
              type: roomTypeData.type,
              pricePerNight,
              amenities: roomTypeData.amenities,
              availableRooms,
              images: {}
            }
          });
          
          // Add 2 images per room to save time
          const roomImagesObj = {};
          for (let j = 0; j < 2; j++) {
            const imageUrl = imageUrls[(index + i + j) % imageUrls.length];
            console.log(`Downloading room image from ${imageUrl}`);
            const imageBuffer = await downloadImage(imageUrl);
            const imagePath = saveRoomImage(imageBuffer, hotel.id, room.id, `image${j + 1}.jpg`);
            roomImagesObj[`image${j + 1}`] = imagePath;
          }
          await prisma.room.update({
            where: { id: room.id },
            data: { images: roomImagesObj }
          });
          console.log(`Created room type: ${room.type} with ${Object.keys(roomImagesObj).length} images`);
        }
      } catch (error) {
        console.error(`Error processing hotel ${hotel.name}:`, error);
      }
    }
    
    console.log("Hotel seeding completed successfully!");
    console.log(`Total hotels created: ${allHotels.length}`);
  } catch (error) {
    console.error("Error during hotel seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    
    // Check if there are still active requests
    console.log(`Checking for active requests: ${activeRequests} remaining`);
    
    // Force exit after a short delay to ensure all connections are properly logged
    setTimeout(() => {
      console.log("Forcing exit to prevent hanging connections");
      process.exit(0);
    }, 1000);
  }
}

main();