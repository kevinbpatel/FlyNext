"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { Edit, Pencil } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useUserContext();

  const [isEditing, setIsEditing] = useState(false);

  // All your typical form fields (firstName, lastName, phone, etc.)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+1",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // For handling new profile pics
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle phone number formatting
    if (name === "phone") {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, "");
      
      // Limit to max 10 digits
      const limitedDigits = digits.slice(0, 10);
      
      // Format with dashes
      let formattedValue = limitedDigits;
      if (limitedDigits.length > 3) {
        formattedValue = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
      }
      if (limitedDigits.length > 6) {
        formattedValue = `${formattedValue.slice(0, 7)}-${formattedValue.slice(7)}`;
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (name === "newPassword" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

 
  // 1. Initialize the form data when `user` is available
  useEffect(() => {
    if (!user) return;

    let phoneNumber = "";
    let countryCode = "+1";
    
    if (user.phone) {
      // Standard country codes are typically 1-3 digits
      const standardCountryCodes = ["+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34", "+36", "+39", "+40", "+41", "+43", "+44", "+45", "+46", "+47", "+48", "+49", "+51", "+52", "+53", "+54", "+55", "+56", "+57", "+58", "+60", "+61", "+62", "+63", "+64", "+65", "+66", "+81", "+82", "+84", "+86", "+90", "+91", "+92", "+93", "+94", "+95", "+98", "+212", "+213", "+216", "+218", "+220", "+221", "+222", "+223", "+224", "+225", "+226", "+227", "+228", "+229", "+230", "+231", "+232", "+233", "+234", "+235", "+236", "+237", "+238", "+239", "+240", "+241", "+242", "+243", "+244", "+245", "+246", "+247", "+248", "+249", "+250", "+251", "+252", "+253", "+254", "+255", "+256", "+257", "+258", "+260", "+261", "+262", "+263", "+264", "+265", "+266", "+267", "+268", "+269", "+290", "+291", "+297", "+298", "+299", "+350", "+351", "+352", "+353", "+354", "+355", "+356", "+357", "+358", "+359", "+370", "+371", "+372", "+373", "+374", "+375", "+376", "+377", "+378", "+379", "+380", "+381", "+382", "+383", "+385", "+386", "+387", "+389", "+420", "+421", "+423", "+500", "+501", "+502", "+503", "+504", "+505", "+506", "+507", "+508", "+509", "+590", "+591", "+592", "+593", "+594", "+595", "+596", "+597", "+598", "+599", "+670", "+672", "+673", "+674", "+675", "+676", "+677", "+678", "+679", "+680", "+681", "+682", "+683", "+685", "+686", "+687", "+688", "+689", "+690", "+691", "+692", "+850", "+852", "+853", "+855", "+856", "+880", "+886", "+960", "+961", "+962", "+963", "+964", "+965", "+966", "+967", "+968", "+970", "+971", "+972", "+973", "+974", "+975", "+976", "+977", "+992", "+993", "+994", "+995", "+996", "+998"];
      
      // Try to find a matching standard country code
      const matchedCountryCode = standardCountryCodes.find(code => user.phone.startsWith(code));
      
      if (matchedCountryCode) {
        countryCode = matchedCountryCode;
        phoneNumber = user.phone.substring(matchedCountryCode.length).trim();
      } else if (user.phone.startsWith('+')) {
        // Fallback: Extract just the country code (+1, +44, etc.)
        const match = user.phone.match(/^\+(\d{1,3})(.*)/);
        if (match) {
          countryCode = `+${match[1]}`;
          phoneNumber = match[2].trim();
        } else {
          // If all else fails, keep the whole number in the phone field
          phoneNumber = user.phone;
        }
      } else {
        // No country code detected, just use the phone number as is
        phoneNumber = user.phone;
      }
      
      // Format the phone number with dashes (digits only)
      const digits = phoneNumber.replace(/\D/g, "");
      let formattedPhone = digits;
      
      if (digits.length > 3) {
        formattedPhone = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      }
      if (digits.length > 6) {
        formattedPhone = `${formattedPhone.slice(0, 7)}-${formattedPhone.slice(7)}`;
      }
      
      phoneNumber = formattedPhone;
    }

    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: phoneNumber,
      countryCode,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [user]);

  // 2. Decide which profile image to display
  useEffect(() => {
    if (!user) {
      setCurrentProfilePicture(null);
      return;
    }

    // If there's a new local file chosen, show that base64 preview
    if (profilePicturePreview) {
      setCurrentProfilePicture(profilePicturePreview);
      return;
    }

    // If user has no custom picture or "default-profile.png"
    if (!user.profilePicture) {
      setCurrentProfilePicture(null);
      return;
    }
    if (user.profilePicture.includes("default-profile.png")) {
      setCurrentProfilePicture("/images/default-profile.png");
      return;
    }

    // Approach B: Use the query parameter approach
    // example: /api/images?p=upload/user_pictures/abc.png
    const routePath = `/api/images?p=${encodeURIComponent(user.profilePicture)}`;
    setCurrentProfilePicture(routePath);
  }, [profilePicturePreview, user?.profilePicture, user]);

  // 3. Trigger the file input if user clicks the pic while editing
  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 4. Handle local file => base64 preview
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePictureFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 5. Validate password fields
  const validatePasswords = (): boolean => {
    if (!formData.newPassword && !formData.confirmPassword) {
      return true;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  // 6. Handle "Save" form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validatePasswords()) return;

    // Optionally validate phone if needed
    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSaving(true);
    try {
      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);

      // If phone is not empty, append phone
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length === 10) {
        submitData.append("phone", formData.countryCode + phoneDigits);
      }

      if (formData.currentPassword && formData.newPassword) {
        submitData.append("currentPassword", formData.currentPassword);
        submitData.append("newPassword", formData.newPassword);
      }

      if (profilePictureFile) {
        submitData.append("profilePicture", profilePictureFile);
      }

      const accessToken = localStorage.getItem("accessToken") || "";
      const response = await fetch("/api/users/edit", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      // On success
      setIsEditing(false);
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });

      // Refresh user context or reload
      window.location.reload();
    } catch (err: any) {
      setErrorMessage(err.message || "An unknown error occurred");
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // 7. Handle "Cancel" editing
  const handleCancel = () => {
    // Re-init data if desired
    if (user) {
      let phoneNumber = "";
      let countryCode = "+1";

      // same phone logic as above if you want to revert changes
      // ...
      // then re-set formData:
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: phoneNumber,
        countryCode,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }

    // Clear out local states
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setIsEditing(false);
    setErrorMessage("");
    setPasswordError("");
  };

  // If the user is still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // If the user is not logged in
  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-foreground">My Profile</h1>

      {errorMessage && (
        <div
          className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2 rounded mb-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Picture and Basic Info */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <div className="relative mr-4">
              {currentProfilePicture ? (
                <img
                  src={currentProfilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                  onClick={handleProfilePictureClick}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-medium"
                  onClick={handleProfilePictureClick}
                >
                  {initials}
                </div>
              )}

              {isEditing && (
                <div
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer"
                  onClick={handleProfilePictureClick}
                >
                  <Pencil size={14} className="text-primary-foreground" />
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {!isEditing && (
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition duration-200"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={18} className="mr-1 inline" /> Edit
            </button>
          )}
        </div>

        {/* Form Fields (firstName, lastName, email, phone...) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-3">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-0.5 text-foreground">First Name</label>
            <input
              type="text"
              name="firstName"
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-0.5 text-foreground">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-0.5 text-foreground">Email</label>
          <input
            type="email"
            name="email"
            className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            required
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-0.5 text-foreground">Phone Number</label>
          <div className="flex w-full">
            {isEditing ? (
              <select
                name="countryCode"
                className="w-32 p-2 border border-border rounded-l focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground"
                value={formData.countryCode}
                onChange={handleChange}
              >
                <option value="+1">+1 (US/CA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+33">+33 (FR)</option>
                <option value="+49">+49 (DE)</option>
                <option value="+91">+91 (IN)</option>
                {/* ... add more as needed */}
              </select>
            ) : (
              <div className="w-32 p-2 bg-muted border border-border rounded-l text-muted-foreground">
                {formData.countryCode}
              </div>
            )}
            <input
              type="tel"
              name="phone"
              placeholder="123-456-7890"
              className="flex-1 p-2 border border-border rounded-r focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Password Section (Only if editing) */}
        {isEditing && (
          <>
            <h2 className="text-lg font-semibold mb-2 text-foreground">Change Password</h2>
            {/* Current Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-0.5 text-foreground">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>

            {/* New Password */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-0.5 text-foreground">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground"
                value={formData.newPassword}
                onChange={handleChange}
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-0.5 ${
                  passwordError ? "text-destructive" : "text-foreground"
                }`}
              >
                Re-enter New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className={`w-full p-2 border ${
                  passwordError ? "border-destructive" : "border-border"
                } rounded focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-foreground`}
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={8}
              />
              {passwordError && <p className="text-xs text-destructive mt-0.5">{passwordError}</p>}
            </div>
          </>
        )}

        {/* Buttons */}
        {isEditing && (
          <div className="flex justify-center mt-4 mb-2">
            <button
              type="button"
              className="px-6 py-2 mx-2 border border-border text-foreground rounded-lg font-medium hover:bg-secondary/50 transition duration-200"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 mx-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition duration-200 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
