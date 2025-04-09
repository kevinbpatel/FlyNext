"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hotel } from "@/types/hotel";

interface BasicHotelMapProps {
  hotels: Hotel[];
  selectedHotel: string | null;
}

// Interface for the markers reference
interface MarkerRef {
  [key: string]: L.Marker;
}

export default function BasicHotelMap({ hotels, selectedHotel }: BasicHotelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<MarkerRef>({});
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Function to check if dark mode is active
  const checkDarkMode = () => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  };

  // Update dark mode state when it changes
  useEffect(() => {
    setIsDarkMode(checkDarkMode());
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(checkDarkMode());
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Get bounds for all hotels to determine map center
  const getBounds = (hotelsList: Hotel[]): L.LatLngBounds | null => {
    const validHotels = hotelsList.filter(
      hotel => hotel.latitude && hotel.longitude
    );
    
    if (validHotels.length === 0) return null;
    
    const bounds = L.latLngBounds([]);
    validHotels.forEach(hotel => {
      if (hotel.latitude && hotel.longitude) {
        bounds.extend([hotel.latitude, hotel.longitude]);
      }
    });
    
    return bounds;
  };

  // Get default center based on hotels or fallback to a default location
  const getDefaultCenter = (): [number, number] => {
    const bounds = getBounds(hotels);
    if (bounds && !bounds.isValid()) {
      return [43.0896, -79.0849]; // Fallback to Niagara Falls
    }
    if (bounds) {
      const center = bounds.getCenter();
      return [center.lat, center.lng];
    }
    return [43.0896, -79.0849]; // Fallback to Niagara Falls
  };

  const defaultZoom = hotels.length > 0 ? 12 : 14;

  // Custom styles for map elements based on theme
  const getMapStyles = () => {
    return `
      .leaflet-popup-content-wrapper {
        background-color: hsl(var(--card));
        color: hsl(var(--card-foreground));
        border-radius: var(--radius);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
      }
      .leaflet-popup-tip {
        background-color: hsl(var(--card));
      }
      .leaflet-container {
        font-family: inherit;
      }
      .map-view-button {
        background-color: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        transition: background-color 0.2s;
        border-radius: var(--radius);
      }
      .map-view-button:hover {
        background-color: hsl(var(--primary) / 0.9);
      }
      .leaflet-control-zoom a {
        background-color: hsl(var(--card)) !important;
        color: hsl(var(--card-foreground)) !important;
        border-color: hsl(var(--border)) !important;
      }
      .leaflet-control-zoom a:hover {
        background-color: hsl(var(--accent)) !important;
        color: hsl(var(--accent-foreground)) !important;
      }
      .leaflet-control-attribution {
        background-color: hsl(var(--card) / 0.8) !important;
        color: hsl(var(--muted-foreground)) !important;
      }
      .leaflet-control-attribution a {
        color: hsl(var(--primary)) !important;
      }
    `;
  };

  useEffect(() => {
    // Make sure this code only runs in the browser and mapRef exists
    if (typeof window === "undefined" || !mapRef.current) return;

    // Add custom styles
    const styleId = 'hotel-map-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = getMapStyles();

    // Check if we have valid hotel coordinates
    const hotelsWithCoords = hotels.filter(
      hotel => hotel.latitude && hotel.longitude
    );
    
    if (hotelsWithCoords.length === 0 && hotels.length > 0) {
      setMapError("No location coordinates available for the hotels");
      return;
    } else {
      setMapError(null);
    }

    // Clean up or initialize the map when theme changes
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Initialize the map
    if (!mapInstance.current) {
      const defaultCenter = getDefaultCenter();
      const map = L.map(mapRef.current, {
        zoomControl: false, // We'll add this in a better position
      }).setView(defaultCenter, defaultZoom);
      
      // Add zoom control in a better position
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Choose a tile provider based on theme
      const tileUrl = isDarkMode 
        ? "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        : "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png";
      
      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Fix Leaflet icon issues in Next.js
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/images/marker-icon-2x.png",
        iconUrl: "/images/marker-icon.png",
        shadowUrl: "/images/marker-shadow.png",
      });

      mapInstance.current = map;
    }

    // Ensure map instance exists
    if (!mapInstance.current) return;

    // Store the current map instance for reference in the cleanup function
    const map = mapInstance.current;

    // Clear any existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};

    // Add markers for each hotel with coordinates
    hotels.forEach(hotel => {
      // Only add markers for hotels with valid coordinates
      if (!hotel.latitude || !hotel.longitude) return;
      
      const isSelected = hotel.id === selectedHotel;
      
      // Create a marker with the actual hotel coordinates
      const marker = L.marker([hotel.latitude, hotel.longitude], {
        zIndexOffset: isSelected ? 1000 : 0
      });
      
      // Create a more attractive popup with theme-aware styling
      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-base mb-1">${hotel.name}</h3>
          ${hotel.price ? `<p class="text-base font-medium" style="color: hsl(var(--primary))">$${hotel.price}/night</p>` : ''}
          <div class="mt-2">
            <a 
              href="/hotels/${hotel.id}" 
              class="map-view-button inline-block px-3 py-1 text-sm hover:opacity-90 transition-opacity"
            >
              View Details
            </a>
          </div>
        </div>
      `, {
        closeButton: false,
        className: 'custom-popup',
      });
      
      // Show popup for selected hotel
      if (isSelected) {
        setTimeout(() => marker.openPopup(), 100);
      }
      
      marker.addTo(map);
      markersRef.current[hotel.id] = marker;
    });

    // Fit map to bounds if we have multiple hotels
    const bounds = getBounds(hotels);
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15
      });
    }

    // Center map on selected hotel if there is one
    if (selectedHotel && markersRef.current[selectedHotel]) {
      const marker = markersRef.current[selectedHotel];
      map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }

    return () => {
      // Just clear the markers instead of removing the map to prevent flicker
      Object.values(markersRef.current).forEach(marker => {
        marker.remove();
      });
      markersRef.current = {};
    };
  }, [hotels, selectedHotel, isDarkMode]); // Added isDarkMode to dependencies

  // Only unmount the map when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      // Clean up style element
      const styleEl = document.getElementById('hotel-map-styles');
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-md transition-all duration-300">
      {mapError ? (
        <div className="w-full h-full bg-card flex items-center justify-center p-4 text-center">
          <p className="text-destructive">{mapError}</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full"></div>
      )}
    </div>
  );
}