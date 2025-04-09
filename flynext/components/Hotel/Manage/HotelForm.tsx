"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Building, Star, MapPin, Save } from "lucide-react";
import MultipleImageUpload from "@/components/Images/MultipleImageUpload";
import LogoUpload from "@/components/Images/LogoUpload";

interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface HotelFormData {
  name: string;
  starRating: number;
  address: Address;
}

interface ImagePreview {
  file: File;
  preview: string;
  name: string;
}

export interface HotelFormProps {
  initialData: HotelFormData;
  logoUrl?: string | null;
  existingImages?: Record<string, string> | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: React.ReactNode;
  cancelButtonText?: string;
  isSubmitting?: boolean;
}

export default function HotelForm({
  initialData,
  logoUrl = null,
  existingImages = null,
  onSubmit,
  onCancel,
  submitButtonText = "Save Changes",
  cancelButtonText = "Cancel",
  isSubmitting: externalIsSubmitting = false,
}: HotelFormProps) {
  const [formData, setFormData] = useState<HotelFormData>(initialData);
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(externalIsSubmitting);

  // Initialize images state with existing images
  useEffect(() => {
    if (existingImages) {
      const initialImages: ImagePreview[] = Object.entries(existingImages).map(([key, url]) => ({
        file: new File([], key), // Create a placeholder File object
        preview: url,
        name: key
      }));
      setImages(initialImages);
    }
  }, [existingImages]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "street" || name === "postalCode" || name === "city" || name === "country") {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "starRating" ? parseInt(value) : value,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Hotel name is required";
    if (!formData.address.street.trim()) newErrors.street = "Street address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.country.trim()) newErrors.country = "Country is required";
    if (!formData.address.postalCode.trim()) newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("starRating", formData.starRating.toString());
      formDataToSend.append("address", JSON.stringify(formData.address));

      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }

      images.forEach((image) => {
        formDataToSend.append(image.name, image.file);
      });

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ form: error instanceof Error ? error.message : "An unknown error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo Upload Component */}
      <LogoUpload
        logoFile={logoFile}
        logoPreview={logoPreview}
        setLogoFile={setLogoFile}
        setLogoPreview={setLogoPreview}
        error={errors.logo}
      />

      {/* Hotel Details Section */}
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-semibold flex items-center mb-4 text-foreground">
          <Building className="w-5 h-5 mr-2 text-primary" />
          Hotel Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotel Name */}
          <div className="col-span-full">
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Hotel Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-background border rounded-md ${errors.name ? 'border-destructive' : 'border-input'} focus:ring-2 focus:ring-ring focus:border-input outline-none transition-colors`}
              placeholder="Enter hotel name"
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Star Rating */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-foreground mb-2">
              Star Rating*
            </label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} className="mr-4 cursor-pointer">
                  <input
                    type="radio"
                    name="starRating"
                    value={star}
                    checked={formData.starRating === star}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div className="flex items-center transition-transform hover:scale-110">
                    <Star
                      className={`w-9 h-9 ${formData.starRating >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Image Upload Component */}
      <MultipleImageUpload 
        images={images}
        onImagesChange={setImages}
        sectionTitle="Hotel Images"
      />

      {/* Address Section */}
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-semibold flex items-center mb-4 text-foreground">
          <MapPin className="w-5 h-5 mr-2 text-primary" />
          Hotel Address
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Street */}
          <div className="col-span-full">
            <label htmlFor="street" className="block text-sm font-medium text-foreground mb-1">
              Street Address*
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.address.street}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-background border rounded-md ${errors.street ? 'border-destructive' : 'border-input'} focus:ring-2 focus:ring-ring focus:border-input outline-none transition-colors`}
              placeholder="123 Main St"
            />
            {errors.street && <p className="text-destructive text-sm mt-1">{errors.street}</p>}
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
              City*
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.address.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-background border rounded-md ${errors.city ? 'border-destructive' : 'border-input'} focus:ring-2 focus:ring-ring focus:border-input outline-none transition-colors`}
              placeholder="Toronto"
            />
            {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-1">
              Postal Code*
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-background border rounded-md ${errors.postalCode ? 'border-destructive' : 'border-input'} focus:ring-2 focus:ring-ring focus:border-input outline-none transition-colors`}
              placeholder="A1B 2C3"
            />
            {errors.postalCode && <p className="text-destructive text-sm mt-1">{errors.postalCode}</p>}
          </div>

          {/* Country */}
          <div className="col-span-full">
            <label htmlFor="country" className="block text-sm font-medium text-foreground mb-1">
              Country*
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.address.country}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-background border rounded-md ${errors.country ? 'border-destructive' : 'border-input'} focus:ring-2 focus:ring-ring focus:border-input outline-none transition-colors`}
              placeholder="Canada"
            />
            {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
          </div>
        </div>
      </div>

      {/* Form Error */}
      {errors.form && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive">{errors.form}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4 mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-input rounded-md text-foreground hover:bg-muted transition-colors"
            disabled={isSubmitting}
          >
            {cancelButtonText}
          </button>
        )}
        <button
          type="submit"
          className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-70 transition-colors shadow-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
              Saving...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              {submitButtonText}
            </span>
          )}
        </button>
      </div>
    </form>
  );
}