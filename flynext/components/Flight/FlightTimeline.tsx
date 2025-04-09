'use client';

import { faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons';
import { faCircle, faPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Flight Timeline component for the top part of the card
interface FlightTimelineProps {
  duration: string;
  isReversed?: boolean;
  isNonstop?: boolean;
  stops?: number;
}

export const FlightTimeline = ({
  duration,
  isReversed = false,
  isNonstop = false,
  stops = 0
}: FlightTimelineProps) => {
  return (
    <div className="flex flex-col items-center flex-1 max-w-xs">
      {/* Main timeline */}
      <div className="w-full relative flex items-center justify-center h-6">
        {/* Left icon - dot or plane depending on isReversed */}
        <div className="absolute left-0 z-10 flex items-center justify-center">
          {!isReversed ? (
            <FontAwesomeIcon
              icon={faCircle}
              className="w-1 h-1 text-muted-foreground/50"
            />
          ) : (
            <FontAwesomeIcon
              icon={faPlane}
              className="w-3 h-3 text-muted-foreground/50"
              style={{ transform: 'rotate(180deg)' }}
            />
          )}
        </div>
        
        {/* Solid line that extends across */}
        <div className="h-px bg-border absolute" style={{ left: '8px', right: '15px' }}></div>
        
        {/* Clock with duration in the middle */}
        <div className="bg-card px-2 z-10 absolute flex items-center">
          <FontAwesomeIcon
            icon={faClockRegular}
            className="w-3 h-3 text-muted-foreground mr-1"
          />
          <span className="text-xs font-medium text-foreground">{duration}</span>
        </div>
        
        {/* Right icon - plane or dot depending on isReversed */}
        <div className="absolute right-0 z-10 flex items-center justify-center">
          {!isReversed ? (
            <FontAwesomeIcon
              icon={faPlane}
              className="w-3 h-3 text-muted-foreground/50"
              style={{ transform: 'rotate(0deg)' }}
            />
          ) : (
            <FontAwesomeIcon
              icon={faCircle}
              className="w-1 h-1 text-muted-foreground/50"
            />
          )}
        </div>
      </div>
      
      {/* Flight type info - positioned right under the duration */}
      <div className="text-xs text-center -mt-1">
        {isNonstop ? (
          <span className="text-primary font-medium">Direct flight</span>
        ) : (
          <span className="text-muted-foreground">{stops} stop{stops !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
};