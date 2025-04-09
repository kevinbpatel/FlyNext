'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { ModalFooterProps } from './types';

const ModalFooter: React.FC<ModalFooterProps> = ({
  onClose,
  onConfirm,
  isSubmitting,
  isConfirmDisabled
}) => {
  return (
    <div className="flex justify-end mt-6 space-x-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted"
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center space-x-1 disabled:opacity-70"
        disabled={isSubmitting || isConfirmDisabled}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <span>Confirm</span>
        )}
      </button>
    </div>
  );
};

export default ModalFooter;