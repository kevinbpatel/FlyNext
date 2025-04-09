import { saveRoomImage, deleteRoomImage } from "@/utils/Images";
import { Buffer } from "buffer";

/**
 * Process and save room images from form data
 * @param {FormData} formData - The form data containing images
 * @param {string} hotelId - The hotel ID
 * @param {string} roomId - The room ID
 * @param {object} existingImages - The existing room images
 * @returns {Promise<object>} The updated images object
 */
export async function processRoomImages(formData, hotelId, roomId, existingImages = {}) {
  let newImagePaths = {};
  let receivedImages = new Set();

  // Process new images
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("image") && value instanceof Blob) {
      try {
        const arrayBuffer = await value.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const imagePath = saveRoomImage(imageBuffer, hotelId, roomId, `${key}.png`);
        
        if (imagePath) {
          newImagePaths[key] = imagePath;
          receivedImages.add(imagePath);
        }
      } catch (error) {
        console.error(`Error processing image ${key}:`, error);
      }
    }
  }

  // Process images to delete
  const imagesToDelete = [];
  if (existingImages && typeof existingImages === 'object') {
    for (let [key, path] of Object.entries(existingImages)) {
      if (!receivedImages.has(path)) {
        imagesToDelete.push(path);
      }
    }
  }

  // Delete old images
  imagesToDelete.forEach(path => {
    try {
      deleteRoomImage(path);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  });

  // Return updated images object
  return { 
    ...existingImages, 
    ...newImagePaths 
  };
}