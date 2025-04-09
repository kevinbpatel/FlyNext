'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { CreateNewBookingButtonProps } from './types';

const CreateNewBookingButton: React.FC<CreateNewBookingButtonProps> = ({ onClick }) => {
  return (
    <div
      className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted"
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
        <Plus className="w-6 h-6 text-primary" />
      </div>
      <span className="text-primary font-medium">Create New Booking</span>
    </div>
  );
};

export default CreateNewBookingButton;