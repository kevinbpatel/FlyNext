// scripts/seed-data.js

exports.hotelOwners = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    password: "Password123!",
    phone: "+1234567890"
  },
  {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    password: "Password123!",
    phone: "+1987654321"
  },
  {
    firstName: "David",
    lastName: "Johnson",
    email: "david.johnson@example.com",
    password: "Password123!",
    phone: "+1122334455"
  },
  {
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    password: "Password123!",
    phone: "+1556677889"
  },
];

exports.roomTypes = [
  {
    type: "Standard Single",
    amenities: ["Free Wi-Fi", "TV", "Air conditioning", "Private bathroom"],
    priceRange: { min: 80, max: 150 }
  },
  {
    type: "Standard Double",
    amenities: ["Free Wi-Fi", "TV", "Air conditioning", "Private bathroom", "Mini fridge"],
    priceRange: { min: 100, max: 200 }
  },
  {
    type: "Deluxe Double",
    amenities: ["Free Wi-Fi", "TV", "Air conditioning", "Private bathroom", "Mini fridge", "Bathtub", "Desk"],
    priceRange: { min: 150, max: 250 }
  },
  {
    type: "Superior Twin",
    amenities: ["Free Wi-Fi", "TV", "Air conditioning", "Private bathroom", "Mini fridge", "Bathtub", "Desk", "City view"],
    priceRange: { min: 180, max: 280 }
  },
  {
    type: "Junior Suite",
    amenities: ["Free Wi-Fi", "TV", "Air conditioning", "Private bathroom", "Mini fridge", "Bathtub", "Desk", "City view", "Sitting area"],
    priceRange: { min: 250, max: 400 }
  },
  {
    type: "Executive Suite",
    amenities: ["Free Wi-Fi", "TV", "Air conditioning", "Private bathroom", "Mini bar", "Bathtub", "Desk", "Panoramic view", "Living room", "Complimentary breakfast"],
    priceRange: { min: 350, max: 600 }
  },
  {
    type: "Presidential Suite",
    amenities: ["Free Wi-Fi", "Smart TV", "Air conditioning", "Private bathroom", "Mini bar", "Jacuzzi", "Office space", "Panoramic view", "Living room", "Dining area", "Butler service", "Complimentary breakfast"],
    priceRange: { min: 800, max: 2000 }
  },
];

exports.torontoHotels = [
  {
    name: "Royal York Hotel",
    address: {
      street: "100 Front Street West",
      city: "Toronto",
      postalCode: "M5J 1E3",
      country: "Canada"
    },
    starRating: 5,
    latitude: 43.6459,
    longitude: -79.3812,
  },
  {
    name: "The Ritz-Carlton Toronto",
    address: {
      street: "181 Wellington Street West",
      city: "Toronto",
      postalCode: "M5V 3G7",
      country: "Canada"
    },
    starRating: 5,
    latitude: 43.6453,
    longitude: -79.3879,
  },
  {
    name: "Four Seasons Hotel Toronto",
    address: {
      street: "60 Yorkville Avenue",
      city: "Toronto",
      postalCode: "M4W 0A4",
      country: "Canada"
    },
    starRating: 5,
    latitude: 43.6716,
    longitude: -79.3905,
  },
  {
    name: "The St. Regis Toronto",
    address: {
      street: "325 Bay Street",
      city: "Toronto",
      postalCode: "M5H 4G3",
      country: "Canada"
    },
    starRating: 5,
    latitude: 43.6485,
    longitude: -79.3810,
  },
  {
    name: "Shangri-La Hotel Toronto",
    address: {
      street: "188 University Avenue",
      city: "Toronto",
      postalCode: "M5H 0A3",
      country: "Canada"
    },
    starRating: 5,
    latitude: 43.6492,
    longitude: -79.3869,
  },
  {
    name: "Hotel Victoria",
    address: {
      street: "56 Yonge Street",
      city: "Toronto",
      postalCode: "M5E 1G5",
      country: "Canada"
    },
    starRating: 3,
    latitude: 43.6484,
    longitude: -79.3772,
  },
  {
    name: "Chelsea Hotel Toronto",
    address: {
      street: "33 Gerrard Street West",
      city: "Toronto",
      postalCode: "M5G 1Z4",
      country: "Canada"
    },
    starRating: 3,
    latitude: 43.6579,
    longitude: -79.3833,
  },
  {
    name: "The Westin Harbour Castle",
    address: {
      street: "1 Harbour Square",
      city: "Toronto",
      postalCode: "M5J 1A6",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6403,
    longitude: -79.3772,
  },
  {
    name: "Thompson Toronto",
    address: {
      street: "550 Wellington Street West",
      city: "Toronto",
      postalCode: "M5V 2V4",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6432,
    longitude: -79.3996,
  },
  {
    name: "The Hazelton Hotel",
    address: {
      street: "118 Yorkville Avenue",
      city: "Toronto",
      postalCode: "M5R 1C2",
      country: "Canada"
    },
    starRating: 5,
    latitude: 43.6706,
    longitude: -79.3939,
  },
  {
    name: "Drake Hotel Toronto",
    address: {
      street: "1150 Queen Street West",
      city: "Toronto",
      postalCode: "M6J 1J3",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6427,
    longitude: -79.4266,
  },
  {
    name: "King Edward Hotel",
    address: {
      street: "37 King Street East",
      city: "Toronto",
      postalCode: "M5C 1E9",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6492,
    longitude: -79.3764,
  },
  {
    name: "Bisha Hotel Toronto",
    address: {
      street: "80 Blue Jays Way",
      city: "Toronto",
      postalCode: "M5V 2G3",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6435,
    longitude: -79.3923,
  },
  {
    name: "Delta Hotels by Marriott Toronto",
    address: {
      street: "75 Lower Simcoe Street",
      city: "Toronto",
      postalCode: "M5J 3A6",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6425,
    longitude: -79.3819,
  },
  {
    name: "One King West Hotel & Residence",
    address: {
      street: "1 King Street West",
      city: "Toronto",
      postalCode: "M5H 1A1",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6486,
    longitude: -79.3777,
  },
  // Additional Toronto hotels to reach 25
  {
    name: "Toronto Marriott City Centre Hotel",
    address: {
      street: "1 Blue Jays Way",
      city: "Toronto",
      postalCode: "M5V 1J4",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6417,
    longitude: -79.3895,
  },
  {
    name: "Pantages Hotel Toronto Centre",
    address: {
      street: "200 Victoria Street",
      city: "Toronto",
      postalCode: "M5B 1V8",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6546,
    longitude: -79.3801,
  },
  {
    name: "InterContinental Toronto Centre",
    address: {
      street: "225 Front Street West",
      city: "Toronto",
      postalCode: "M5V 2X3",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6451,
    longitude: -79.3857,
  },
  {
    name: "Le Germain Hotel Toronto",
    address: {
      street: "30 Mercer Street",
      city: "Toronto",
      postalCode: "M5V 1H3",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6468,
    longitude: -79.3899,
  },
  {
    name: "Toronto Marriott Downtown Eaton Centre",
    address: {
      street: "525 Bay Street",
      city: "Toronto",
      postalCode: "M5G 2L2",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6556,
    longitude: -79.3832,
  },
  {
    name: "The Broadview Hotel",
    address: {
      street: "106 Broadview Avenue",
      city: "Toronto",
      postalCode: "M4M 1G9",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6594,
    longitude: -79.3519,
  },
  {
    name: "Holiday Inn Toronto Downtown Centre",
    address: {
      street: "30 Carlton Street",
      city: "Toronto",
      postalCode: "M5B 2E9",
      country: "Canada"
    },
    starRating: 3,
    latitude: 43.6613,
    longitude: -79.3811,
  },
  {
    name: "Bond Place Hotel",
    address: {
      street: "65 Dundas Street East",
      city: "Toronto",
      postalCode: "M5B 2G8",
      country: "Canada"
    },
    starRating: 3,
    latitude: 43.6567,
    longitude: -79.3787,
  },
  {
    name: "The Anndore House",
    address: {
      street: "15 Charles Street East",
      city: "Toronto",
      postalCode: "M4Y 1S1",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6705,
    longitude: -79.3843,
  },
  {
    name: "Gladstone House",
    address: {
      street: "1214 Queen Street West",
      city: "Toronto",
      postalCode: "M6J 1J6",
      country: "Canada"
    },
    starRating: 4,
    latitude: 43.6421,
    longitude: -79.4294,
  },
];

exports.tokyoHotels = [
  // Shinjuku area hotels
  {
    name: "Park Hyatt Tokyo",
    address: {
      street: "3-7-1-2 Nishi Shinjuku",
      city: "Tokyo",
      postalCode: "163-1055",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6866,
    longitude: 139.6907,
  },
  {
    name: "Keio Plaza Hotel Tokyo",
    address: {
      street: "2-2-1 Nishi Shinjuku",
      city: "Tokyo",
      postalCode: "160-8330",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6905,
    longitude: 139.6958,
  },
  {
    name: "Hotel Century Southern Tower",
    address: {
      street: "2-2-1 Yoyogi",
      city: "Tokyo",
      postalCode: "151-8583",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6858,
    longitude: 139.6962,
  },
  {
    name: "Shinjuku Granbell Hotel",
    address: {
      street: "2-14-5 Kabukicho",
      city: "Tokyo",
      postalCode: "160-0021",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6968,
    longitude: 139.7037,
  },
  {
    name: "Hyatt Regency Tokyo",
    address: {
      street: "2-7-2 Nishi-Shinjuku",
      city: "Tokyo",
      postalCode: "160-0023",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6893,
    longitude: 139.6899,
  },
  
  // Shibuya area hotels
  {
    name: "Cerulean Tower Tokyu Hotel",
    address: {
      street: "26-1 Sakuragaoka-cho",
      city: "Tokyo",
      postalCode: "150-8512",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6562,
    longitude: 139.7005,
  },
  {
    name: "Shibuya Excel Hotel Tokyu",
    address: {
      street: "1-12-2 Dogenzaka",
      city: "Tokyo",
      postalCode: "150-0043",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6580,
    longitude: 139.7016,
  },
  {
    name: "Shibuya Stream Excel Hotel Tokyu",
    address: {
      street: "3-21-3 Shibuya",
      city: "Tokyo",
      postalCode: "150-0002",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6560,
    longitude: 139.7025,
  },
  
  // Ginza/Tokyo Station area
  {
    name: "Imperial Hotel Tokyo",
    address: {
      street: "1-1-1 Uchisaiwaicho",
      city: "Tokyo",
      postalCode: "100-8558",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6695,
    longitude: 139.7595,
  },
  {
    name: "The Peninsula Tokyo",
    address: {
      street: "1-8-1 Yurakucho",
      city: "Tokyo",
      postalCode: "100-0006",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6731,
    longitude: 139.7631,
  },
  {
    name: "Palace Hotel Tokyo",
    address: {
      street: "1-1-1 Marunouchi",
      city: "Tokyo",
      postalCode: "100-0005",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6817,
    longitude: 139.7612,
  },
  {
    name: "Tokyo Station Hotel",
    address: {
      street: "1-9-1 Marunouchi",
      city: "Tokyo",
      postalCode: "100-0005",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6814,
    longitude: 139.7671,
  },
  {
    name: "Mitsui Garden Hotel Ginza Premier",
    address: {
      street: "8-13-1 Ginza",
      city: "Tokyo",
      postalCode: "104-0061",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6729,
    longitude: 139.7697,
  },
  
  // Roppongi/Akasaka area
  {
    name: "The Ritz-Carlton Tokyo",
    address: {
      street: "9-7-1 Akasaka",
      city: "Tokyo",
      postalCode: "107-6245",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6658,
    longitude: 139.7311,
  },
  {
    name: "Grand Hyatt Tokyo",
    address: {
      street: "6-10-3 Roppongi",
      city: "Tokyo",
      postalCode: "106-0032",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6607,
    longitude: 139.7293,
  },
  {
    name: "ANA InterContinental Tokyo",
    address: {
      street: "1-12-33 Akasaka",
      city: "Tokyo",
      postalCode: "107-0052",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6717,
    longitude: 139.7377,
  },
  
  // Tokyo Bay/Odaiba area
  {
    name: "Hilton Tokyo Odaiba",
    address: {
      street: "1-9-1 Daiba",
      city: "Tokyo",
      postalCode: "135-8625",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6279,
    longitude: 139.7744,
  },
  {
    name: "Grand Nikko Tokyo Daiba",
    address: {
      street: "2-6-1 Daiba",
      city: "Tokyo",
      postalCode: "135-8701",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6246,
    longitude: 139.7747,
  },
  
  // Asakusa/Ueno area
  {
    name: "The Gate Hotel Asakusa Kaminarimon",
    address: {
      street: "2-16-11 Kaminarimon",
      city: "Tokyo",
      postalCode: "111-0034",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.7107,
    longitude: 139.7967,
  },
  {
    name: "Asakusa View Hotel",
    address: {
      street: "3-17-1 Nishi Asakusa",
      city: "Tokyo",
      postalCode: "111-8765",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.7128,
    longitude: 139.7981,
  },
  
  // Financial district/Nihombashi
  {
    name: "Mandarin Oriental Tokyo",
    address: {
      street: "2-1-1 Nihonbashi Muromachi",
      city: "Tokyo",
      postalCode: "103-8328",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6861,
    longitude: 139.7722,
  },
  {
    name: "Aman Tokyo",
    address: {
      street: "1-5-6 Otemachi",
      city: "Tokyo",
      postalCode: "100-0004",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6876,
    longitude: 139.7647,
  },
  {
    name: "Hoshinoya Tokyo",
    address: {
      street: "1-9-1 Otemachi",
      city: "Tokyo",
      postalCode: "100-0004",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6895,
    longitude: 139.7673,
  },
  {
    name: "Conrad Tokyo",
    address: {
      street: "1-9-1 Higashi-Shinbashi",
      city: "Tokyo",
      postalCode: "105-7337",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6658,
    longitude: 139.7603,
  },
  {
    name: "Andaz Tokyo Toranomon Hills",
    address: {
      street: "1-23-4 Toranomon",
      city: "Tokyo",
      postalCode: "105-0001",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6691,
    longitude: 139.7451,
  },
  // Additional Tokyo hotels to get to 25+
  {
    name: "Hotel Okura Tokyo",
    address: {
      street: "2-10-4 Toranomon",
      city: "Tokyo",
      postalCode: "105-0001",
      country: "Japan"
    },
    starRating: 5,
    latitude: 35.6693,
    longitude: 139.7449,
  },
  {
    name: "Shinagawa Prince Hotel",
    address: {
      street: "4-10-30 Takanawa",
      city: "Tokyo",
      postalCode: "108-8611",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6287,
    longitude: 139.7364,
  },
  {
    name: "Hotel New Otani Tokyo",
    address: {
      street: "4-1 Kioi-cho",
      city: "Tokyo",
      postalCode: "102-8578",
      country: "Japan"
    },
    starRating: 4,
    latitude: 35.6848,
    longitude: 139.7373,
  },
];

exports.profileImages = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4'
];

exports.imageUrls = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5',
  'https://picsum.photos/800/600?random=6',
  'https://picsum.photos/800/600?random=7',
  'https://picsum.photos/800/600?random=8',
  'https://picsum.photos/800/600?random=9',
  'https://picsum.photos/800/600?random=10',
  'https://picsum.photos/800/600?random=11',
  'https://picsum.photos/800/600?random=12'
];
