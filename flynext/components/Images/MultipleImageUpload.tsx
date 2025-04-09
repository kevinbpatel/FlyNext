"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Camera, X, Plus } from "lucide-react";

interface ImagePreview {
  file: File;
  preview: string;
  name: string;
}

interface MultipleImageUploadProps {
  images: ImagePreview[];
  onImagesChange: (images: ImagePreview[]) => void;
  sectionTitle?: string;
}

export default function MultipleImageUpload({
  images,
  onImagesChange,
  sectionTitle = "Images"
}: MultipleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const newImages = newFiles.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        name: `image${images.length + index + 1}`, // image1, image2, etc.
      }));

      onImagesChange([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);

    // Rename remaining images to ensure sequential naming
    const renamedImages = newImages.map((img, idx) => ({
      ...img,
      name: `image${idx + 1}`,
    }));

    onImagesChange(renamedImages);
  };

  return (
    <>
      <h2 className="text-base font-medium flex items-center mb-4 text-foreground">
        <Camera className="w-5 h-5 mr-2 text-primary" />
        {sectionTitle}
      </h2>

      {images.length === 0 ? (
        // Full width "Add Image" button when no images
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-border rounded-lg h-48 w-full flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-10 h-10 text-primary/70 mb-2" />
          <p className="text-base font-medium text-foreground">Add Images</p>
          <p className="text-sm text-muted-foreground mt-1">Click to upload photos</p>
        </div>
      ) : (
        // Grid layout when images exist
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Image Previews */}
          {images.map((image, index) => (
            <div key={index} className="relative border border-border rounded-lg overflow-hidden h-36 bg-muted shadow-sm">
              <img
                src={image.preview}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-background text-foreground rounded-full p-1 shadow-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Image Button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-border rounded-lg h-36 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-8 h-8 text-primary/70 mb-1" />
            <p className="text-sm text-foreground">Add Images</p>
            <p className="text-xs text-muted-foreground mt-1">Upload photos</p>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImagesChange}
      />
    </>
  );
}