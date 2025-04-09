'use client';

import React from 'react';
import {
  Clock,
  PlaneTakeoff,
  PlaneLanding,
  RefreshCcw
} from 'lucide-react';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Airline {
  code: string;
  name: string;
  logo?: string;
}

interface FlightSegment {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  originId: string;
  destinationId: string;
  duration: number;
  price: number;
  currency: string;
  airline: Airline;
  origin: Airport;
  destination: Airport;
}

interface FlightDetailTimelineProps {
  departureDateFormatted: string;
  departureTimeFormatted: string;
  arrivalDateFormatted: string;
  arrivalTimeFormatted: string;
  duration: string;
  airline: Airline;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  hasLayover: boolean;
  segments: FlightSegment[];
  formatDate: (timeString: string) => string;
  formatTime: (timeString: string) => string;
  formatDuration: (minutes: number) => string;
  calculateLayoverDuration: (prevFlight: FlightSegment, nextFlight: FlightSegment) => string;
}

// Flight Detail Step helper component (internal to this file)
interface FlightDetailStepProps {
  icon: React.ReactNode;
  showLine?: boolean;
  children: React.ReactNode;
}

const FlightDetailStep = ({
  icon,
  showLine = true,
  children
}: FlightDetailStepProps) => {
  return (
    <div className="flex">
      <div className="flex flex-col items-center w-8">
        {icon}
        {showLine && <div className="h-12 w-px bg-border mt-2 mb-2"></div>}
      </div>
      <div className={showLine ? "pb-6" : ""}>
        {children}
      </div>
    </div>
  );
};

export const FlightDetailTimeline = ({
  departureDateFormatted,
  departureTimeFormatted,
  arrivalDateFormatted,
  arrivalTimeFormatted,
  duration,
  airline,
  flightNumber,
  origin,
  destination,
  hasLayover,
  segments,
  formatDate,
  formatTime,
  formatDuration,
  calculateLayoverDuration
}: FlightDetailTimelineProps) => {
  return (
    <div className="border-t border-border px-6 py-4 bg-muted/30">
      <div className="flex flex-col">
        {/* For non-stop flights */}
        {!hasLayover && (
          <>
            {/* Origin City */}
            <FlightDetailStep 
              icon={<PlaneTakeoff className="text-muted-foreground w-4 h-4 mt-1" />}
            >
              <div className="text-sm font-medium text-foreground">Depart {departureDateFormatted}, {departureTimeFormatted}</div>
              <div className="text-xs text-muted-foreground">{origin.name} ({origin.code})</div>
            </FlightDetailStep>

            {/* Airline Info */}
            <FlightDetailStep 
              icon={<svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-muted-foreground w-5 h-5 mt-1"
                style={{ transform: 'rotate(90deg)' }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z" />
              </svg>}
            >
              <div className="pb-4 -mt-0.5">
                <div className="text-sm font-medium text-foreground">{airline.name} ({flightNumber})</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 w-3 h-3" />
                  {duration}
                </div>
              </div>
            </FlightDetailStep>

            {/* Destination City */}
            <FlightDetailStep 
              icon={<PlaneLanding className="text-muted-foreground w-4 h-4" />}
              showLine={false}
            >
              <div className="-mt-0.5">
                <div className="text-sm font-medium text-foreground">Arrive {arrivalDateFormatted}, {arrivalTimeFormatted}</div>
                <div className="text-xs text-muted-foreground">{destination.name} ({destination.code})</div>
              </div>
            </FlightDetailStep>
          </>
        )}

        {/* For flights with layovers */}
        {hasLayover && segments.map((segment, index) => (
          <div key={segment.id}>
            {/* Origin City (only for first segment) */}
            {index === 0 && (
              <FlightDetailStep 
                icon={<PlaneTakeoff className="text-muted-foreground w-4 h-4 mt-1" />}
              >
                <div className="pb-6">
                  <div className="text-sm font-medium text-foreground">
                    Depart {formatDate(segment.departureTime)}, {formatTime(segment.departureTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {segment.origin.name} ({segment.origin.code})
                  </div>
                </div>
              </FlightDetailStep>
            )}

            {/* Airline Info */}
            <FlightDetailStep 
              icon={<svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-muted-foreground w-5 h-5 mt-1"
                style={{ transform: 'rotate(90deg)' }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z" />
              </svg>}
            >
              <div className="pb-4 -mt-0.5">
                <div className="text-sm font-medium text-foreground">
                  {segment.airline.name} ({segment.flightNumber})
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 w-3 h-3" />
                  {formatDuration(segment.duration)}
                </div>
              </div>
            </FlightDetailStep>

            {/* Layover Info (between segments) */}
            {index < segments.length - 1 && (
              <FlightDetailStep 
                icon={<RefreshCcw className="text-muted-foreground w-4 h-4 mt-1" />}
              >
                <div className="pb-6">
                  <div className="text-sm font-medium text-foreground">
                    Layover · {segment.destination.city} ({segment.destination.code})
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 w-3 h-3" />
                    {calculateLayoverDuration(segment, segments[index + 1])} layover
                  </div>
                </div>
              </FlightDetailStep>
            )}

            {/* Destination City (only for last segment) */}
            {index === segments.length - 1 && (
              <FlightDetailStep 
                icon={<PlaneLanding className="text-muted-foreground w-4 h-4 mt-1" />}
                showLine={false}
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Arrive {formatDate(segment.arrivalTime)}, {formatTime(segment.arrivalTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {segment.destination.name} ({segment.destination.code})
                  </div>
                </div>
              </FlightDetailStep>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};