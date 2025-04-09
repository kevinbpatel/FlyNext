"use client";

import { useRouter } from "next/navigation";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import HotelForm, { HotelFormData } from "@/components/Hotel/Manage/HotelForm";

export default function AddHotelPage() {
  const { isAuthenticated, isLoading, fetchWithAuth } = useAuthRedirect("/hotels/add");
  const router = useRouter();

  const initialData: HotelFormData = {
    name: "",
    starRating: 3,
    address: {
      street: "",
      postalCode: "",
      city: "",
      country: "",
    },
  };

  const handleSubmit = async (formData: FormData) => {
    const response = await fetchWithAuth("/api/hotels/add", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      router.push("/manage");
    } else {
      const error = await response.json();
      throw new Error(error.message || "Failed to create hotel");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Hotel</h1>
      
      <HotelForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/manage")}
        submitButtonText="Add Hotel"
        cancelButtonText="Cancel"
      />
    </div>
  );
}