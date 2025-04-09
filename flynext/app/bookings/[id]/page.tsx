'use client';

import { useParams } from 'next/navigation';
import BookingDetailsPage from '@/components/Bookings/BookingDetails';

export default function BookingDetailsPageWrapper() {
  const params = useParams();
  // Ensure id is a string: if it's an array, take the first element; if undefined, render a fallback.
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  console.log("the id in booking supposed tobe is : ", id )
  if (!id) {
    // Optionally, handle the case where id is missing.
    return <div>Loading...</div>;
  }

  return <BookingDetailsPage params={{ id }} />;
}