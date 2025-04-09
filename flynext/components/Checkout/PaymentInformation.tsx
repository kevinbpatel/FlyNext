'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentInfoProps {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  formErrors: {[key: string]: string};
  handleCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExpiryDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentInformation: React.FC<PaymentInfoProps> = ({
  cardNumber,
  cardholderName,
  expiryDate,
  cvv,
  formErrors,
  handleCardNumberChange,
  handleExpiryDateChange,
  handleInputChange
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center mb-3">
        <CreditCard className="w-4 h-4 text-primary mr-2" />
        <h2 className="text-lg font-medium text-card-foreground">Payment Information</h2>
      </div>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-card-foreground mb-1">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19} // 16 digits + 3 spaces
            className={`w-full p-2 border bg-background ${formErrors.cardNumber ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
            placeholder="•••• •••• •••• ••••"
          />
          {formErrors.cardNumber && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.cardNumber}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-card-foreground mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            value={cardholderName}
            onChange={handleInputChange}
            className={`w-full p-2 border bg-background ${formErrors.cardholderName ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
            placeholder="Enter name as it appears on card"
          />
          {formErrors.cardholderName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.cardholderName}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-card-foreground mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              maxLength={5} // MM/YY
              className={`w-full p-2 border bg-background ${formErrors.expiryDate ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
              placeholder="MM/YY"
            />
            {formErrors.expiryDate && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.expiryDate}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-card-foreground mb-1">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={cvv}
              onChange={handleInputChange}
              maxLength={4}
              className={`w-full p-2 border bg-background ${formErrors.cvv ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg text-foreground`}
              placeholder="•••"
            />
            {formErrors.cvv && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.cvv}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInformation;