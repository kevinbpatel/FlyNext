"use client";

import { useRef, ChangeEvent } from "react";
import { X, Upload } from "lucide-react";

interface LogoUploadProps {
  logoFile: File | null;
  logoPreview: string | null;
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
  error?: string;
  title?: string;
  subtitle?: string;
}

export default function LogoUpload({
  logoFile,
  logoPreview,
  setLogoFile,
  setLogoPreview,
  error,
  title = "Hotel Logo",
  subtitle = "Upload a high-quality logo for your hotel"
}: LogoUploadProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-center text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">{subtitle}</p>
      </div>
      
      <div
        onClick={() => logoInputRef.current?.click()}
        className={`cursor-pointer border-2 ${
          logoPreview ? 'border-solid border-primary/40' : 'border-dashed'
        } border-border rounded-lg w-48 h-48 flex flex-col items-center justify-center 
        overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md ${
          error ? 'border-destructive' : ''
        }`}
      >
        {logoPreview ? (
          <div className="relative w-full h-full bg-muted">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-full h-full object-contain p-2"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLogoPreview(null);
                setLogoFile(null);
              }}
              className="absolute top-2 right-2 bg-background shadow-md text-foreground rounded-full p-1 hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center p-4 text-center">
            <Upload className="w-12 h-12 text-primary/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Upload Logo</p>
          </div>
        )}
      </div>
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoChange}
      />
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
}