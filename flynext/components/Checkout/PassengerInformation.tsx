'use client';

import React from 'react';
import { User } from 'lucide-react';

// Passenger information interface
interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  dateOfBirth: string;
}

interface PassengerInformationProps {
  passengerInfo: PassengerInfo;
  formErrors: {[key: string]: string};
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PassengerInformation: React.FC<PassengerInformationProps> = ({
  passengerInfo,
  formErrors,
  handleInputChange
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center mb-3">
        <User className="w-4 h-4 text-primary mr-2" />
        <h2 className="text-lg font-medium text-card-foreground">Passenger Information</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-card-foreground mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="passengerInfo.firstName"
            value={passengerInfo.firstName}
            onChange={handleInputChange}
            className={`w-full p-2 border bg-background ${formErrors['passengerInfo.firstName'] ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
            placeholder="Enter first name"
          />
          {formErrors['passengerInfo.firstName'] && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors['passengerInfo.firstName']}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-card-foreground mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="passengerInfo.lastName"
            value={passengerInfo.lastName}
            onChange={handleInputChange}
            className={`w-full p-2 border bg-background ${formErrors['passengerInfo.lastName'] ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
            placeholder="Enter last name"
          />
          {formErrors['passengerInfo.lastName'] && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors['passengerInfo.lastName']}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="passengerInfo.email"
            value={passengerInfo.email}
            onChange={handleInputChange}
            className={`w-full p-2 border bg-background ${formErrors['passengerInfo.email'] ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
            placeholder="Enter email address"
          />
          {formErrors['passengerInfo.email'] && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors['passengerInfo.email']}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-card-foreground mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="passengerInfo.dateOfBirth"
            value={passengerInfo.dateOfBirth}
            onChange={handleInputChange}
            className={`w-full p-2 border bg-background ${formErrors['passengerInfo.dateOfBirth'] ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
          />
          {formErrors['passengerInfo.dateOfBirth'] && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors['passengerInfo.dateOfBirth']}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="passportNumber" className="block text-sm font-medium text-card-foreground mb-1">
            Passport Number
          </label>
          <input
            type="text"
            id="passportNumber"
            name="passengerInfo.passportNumber"
            value={passengerInfo.passportNumber}
            onChange={handleInputChange}
            maxLength={9}
            className={`w-full p-2 border bg-background ${formErrors['passengerInfo.passportNumber'] ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
            placeholder="Enter 9-digit passport number"
          />
          {formErrors['passengerInfo.passportNumber'] && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors['passengerInfo.passportNumber']}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerInformation;