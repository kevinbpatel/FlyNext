"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  /** Raw file paths from e.g. "upload/hotels/hotel123/1.png" */
  images: string[];
  altText: string;
  fallbackIcon?: React.ReactNode;
  height?: string;
  showIndicators?: boolean;
  buttonSize?: "small" | "medium";
  className?: string;
}

/**
 * ImageCarousel that auto-builds each src as /api/images?p=<encoded path>.
 * This ensures newly uploaded files in public/ can be served at runtime in production.
 */
export default function ImageCarousel({
  images,
  altText,
  fallbackIcon,
  height = "h-48",
  showIndicators = false,
  buttonSize = "small",
  className = ""
}: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 1. Transform each path: "upload/hotels/123.png" => "/api/images?p=upload/hotels/123.png"
  const transformedImages = useMemo(() => {
    return images.map((rawPath) => `/api/images?p=${encodeURIComponent(rawPath)}`);
  }, [images]);

  // 2. Basic carousel controls
  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % transformedImages.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + transformedImages.length) % transformedImages.length);
  };

  // 3. Button style config
  const buttonStyles = {
    small: {
      button: "p-1",
      icon: "w-4 h-4"
    },
    medium: {
      button: "p-2",
      icon: "w-5 h-5"
    }
  };

  // 4. If no images, show fallback
  if (transformedImages.length === 0) {
    return (
      <div className={`relative ${height} bg-muted flex items-center justify-center ${className}`}>
        {fallbackIcon}
      </div>
    );
  }

  // 5. Render the current image
  return (
    <div className={`relative ${height} bg-muted ${className} group`}>
      <img
        src={transformedImages[currentImageIndex]}
        alt={`${altText} view ${currentImageIndex + 1}`}
        className="w-full h-full object-cover group-hover:opacity-100"
      />

      {transformedImages.length > 1 && (
        <>
          <button
            onClick={goToPrevImage}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full ${
              buttonStyles[buttonSize].button
            } hover:bg-opacity-70`}
          >
            <ChevronLeft className={buttonStyles[buttonSize].icon} />
          </button>
          <button
            onClick={goToNextImage}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full ${
              buttonStyles[buttonSize].button
            } hover:bg-opacity-70`}
          >
            <ChevronRight className={buttonStyles[buttonSize].icon} />
          </button>

          {showIndicators && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
              {transformedImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`mx-1 w-2 h-2 rounded-full ${
                    currentImageIndex === index ? "bg-white" : "bg-white bg-opacity-50"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
