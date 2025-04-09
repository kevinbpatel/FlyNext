/**
 * Validate room updates
 * @param {object} data - The data to validate
 * @param {object} room - The existing room data
 * @returns {object} The validated updates and any errors
 */
export function validateRoomUpdates(data, room) {
  const updates = {};
  const errors = {};

  // Validate type/name
  if (data.name || data.type) {
    updates.type = data.name || data.type;
  }

  // Validate description
  if (data.description !== undefined) {
    updates.description = data.description;
  }

  // Validate price
  if (data.pricePerNight !== undefined || data.price !== undefined) {
    let price = parseFloat(data.pricePerNight || data.price);
    if (isNaN(price) || price <= 0) {
      errors.price = "Price must be greater than 0";
    } else {
      // Convert to string for Prisma Decimal field
      updates.pricePerNight = String(price);
    }
  }

  // Validate amenities
  if (data.amenities !== undefined) {
    try {
      updates.amenities = typeof data.amenities === 'string'
         ? JSON.parse(data.amenities)
         : data.amenities;
    } catch (error) {
      errors.amenities = "Invalid amenities format";
    }
  }

  // Validate images
  if (data.images !== undefined) {
    updates.images = data.images;
  }

  return { updates, errors };
}