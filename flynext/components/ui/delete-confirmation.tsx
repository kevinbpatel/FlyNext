"use client";

interface DeleteConfirmationProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmation({ 
  message, 
  onCancel, 
  onConfirm 
}: DeleteConfirmationProps) {
  return (
    <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
      <p className="text-sm text-red-700 mb-2">{message}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}