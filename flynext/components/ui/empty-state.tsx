"use client";

import { Plus } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  buttonText,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-muted rounded-lg">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <button
        onClick={onAction}
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        {buttonText}
      </button>
    </div>
  );
}