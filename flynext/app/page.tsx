'use client';

import { Suspense, useState } from "react";
import { FlightSearch } from "@/components/Search/FlightSearchBar";
import { HotelSearch } from "@/components/Search/HotelSearchBar";
import { TripTypeSelector } from "@/components/Search/TripTypeSelector";
import { Plane, Building } from 'lucide-react';
import { useUserContext } from "@/contexts/UserContext";

function HomeContent() {
  // State for tab control
  const [activeTab, setActiveTab] = useState("flights");
  // State for trip type
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>('round-trip');

  return (
    <div className="container mx-auto min-h-screen backdrop-blur-[1px] flex flex-col">
      {/* Hero section with headline and tagline */}
      <div className="pt-6 sm:pt-12 md:pt-20 lg:pt-12 xl:pt-8 2xl:pt-28 pb-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-center text-foreground drop-shadow-lg leading-tight mb-3 tracking-tight">
          Find your <span className="text-primary dark:text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Perfect</span> Journey
        </h1>
        <p className="text-base md:text-lg text-center text-muted-foreground dark:text-muted-foreground max-w-4xl mx-auto leading-relaxed drop-shadow-sm">
          Plan unforgettable trips with ease and clarity. Unplug, unwind, and travel with peace of mind.
        </p>
      </div>
      
      <div className="flex-grow flex items-end sm:flex-grow-0 sm:mt-20 md:flex-grow-0 md:mt-24 lg:flex-grow-0 lg:mt-32 xl:flex-grow-0 xl:mt-40 2xl:flex-grow-0 2xl:mt-42">
        <div className="w-full pb-8 sm:pb-10 md:pb-10 lg:pb-8 xl:pb-6 2xl:pb-4">
          {/* Control bar with tabs and trip type selector */}
          <div className="flex items-center mb-4 relative">
            {activeTab === "flights" && (
              <div className="absolute left-0">
                <TripTypeSelector tripType={tripType} onTripTypeChange={setTripType} />
              </div>
            )}
            <div className="mx-auto">
              <div className="inline-flex space-x-2 rounded-lg p-1 shadow-md bg-card/90">
                <button
                  onClick={() => setActiveTab("flights")}
                  className={`h-10 px-4 py-2 text-sm font-medium flex items-center rounded-lg transition-all duration-200 ${
                    activeTab === "flights"
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-card hover:bg-muted/90 text-foreground"
                  }`}
                >
                  <Plane className={`w-4 h-4 mr-1.5 ${
                    activeTab === "flights" ? "text-primary-foreground" : "text-primary"
                  }`} />
                  Flights
                </button>
                <button
                  onClick={() => setActiveTab("hotels")}
                  className={`h-10 px-4 py-2 text-sm font-medium flex items-center rounded-lg transition-all duration-200 ${
                    activeTab === "hotels"
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-card hover:bg-muted/90 text-foreground"
                  }`}
                >
                  <Building className={`w-4 h-4 mr-1.5 ${
                    activeTab === "hotels" ? "text-primary-foreground" : "text-primary"
                  }`} />
                  Hotels
                </button>
              </div>
            </div>
          </div>
          
          {/* Search components */}
          <div className="mb-8">
            {activeTab === "flights" && <FlightSearch tripType={tripType} />}
            {activeTab === "hotels" && <HotelSearch />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading home page...</div>}>
      <HomeContent />
    </Suspense>
  );
}
