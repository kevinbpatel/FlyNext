import { useState, useEffect } from 'react';

// Payment form data interface
export interface PaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    passportNumber: string;
    dateOfBirth: string;
  }
}

/**
 * Hook to manage payment form state, validation, and formatting
 */
export function usePaymentForm() {
  // Check if dev mode is enabled
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  
  // Form state - initialize with test data if in dev mode
  const [formData, setFormData] = useState<PaymentFormData>(() => {
    // Return test data in dev mode, empty form otherwise
    if (isDevMode) {
      return {
        cardNumber: process.env.NEXT_PUBLIC_TEST_CARD_NUMBER || '4242 4242 4242 4242',
        cardholderName: process.env.NEXT_PUBLIC_TEST_CARDHOLDER_NAME || 'Kevin Patel',
        expiryDate: process.env.NEXT_PUBLIC_TEST_EXPIRY_DATE || '12/25',
        cvv: process.env.NEXT_PUBLIC_TEST_CVV || '123',
        passengerInfo: {
          firstName: process.env.NEXT_PUBLIC_TEST_FIRST_NAME || 'Kevin',
          lastName: process.env.NEXT_PUBLIC_TEST_LAST_NAME || 'Doe',
          email: process.env.NEXT_PUBLIC_TEST_EMAIL || 'john.doe@example.com',
          passportNumber: process.env.NEXT_PUBLIC_TEST_PASSPORT || 'AB1234567',
          dateOfBirth: process.env.NEXT_PUBLIC_TEST_DOB || '1990-01-01',
        }
      };
    } else {
      return {
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: '',
        passengerInfo: {
          firstName: '',
          lastName: '',
          email: '',
          passportNumber: '',
          dateOfBirth: '',
        }
      };
    }
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handle general input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes('passengerInfo.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        passengerInfo: {
          ...formData.passengerInfo,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  /**
   * Format card number with spaces every 4 digits
   */
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < digits.length; i += 4) {
      formatted += digits.slice(i, i + 4) + ' ';
    }
    return formatted.trim().slice(0, 19);
  };

  /**
   * Handle card number input with formatting
   */
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formattedValue
    });

    if (formErrors.cardNumber) {
      setFormErrors({
        ...formErrors,
        cardNumber: ''
      });
    }
  };

  /**
   * Format expiry date as MM/YY
   */
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  /**
   * Handle expiry date input with formatting
   */
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setFormData({
      ...formData,
      expiryDate: formattedValue
    });

    if (formErrors.expiryDate) {
      setFormErrors({
        ...formErrors,
        expiryDate: ''
      });
    }
  };

  /**
   * Validate all form fields
   * @returns boolean indicating if the form is valid
   */
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Card validation
    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      errors.cardNumber = 'Valid 16-digit card number is required';
    }

    if (!formData.cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }

    if (!formData.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Valid expiry date (MM/YY) is required';
    } else {
      // Check if card is expired
      const [month, year] = formData.expiryDate.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const today = new Date();

      if (expiryDate < today) {
        errors.expiryDate = 'Card has expired';
      }
    }

    if (!formData.cvv.trim() || !/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'Valid CVV is required (3-4 digits)';
    }

    // Passenger validation
    if (!formData.passengerInfo.firstName.trim()) {
      errors['passengerInfo.firstName'] = 'First name is required';
    }

    if (!formData.passengerInfo.lastName.trim()) {
      errors['passengerInfo.lastName'] = 'Last name is required';
    }

    if (!formData.passengerInfo.email.trim() || !/\S+@\S+\.\S+/.test(formData.passengerInfo.email)) {
      errors['passengerInfo.email'] = 'Valid email is required';
    }

    if (!formData.passengerInfo.passportNumber.trim()) {
      errors['passengerInfo.passportNumber'] = 'Passport number is required';
    } else if (formData.passengerInfo.passportNumber.length !== 9) {
      errors['passengerInfo.passportNumber'] = 'Passport number must be exactly 9 characters';
    }

    if (!formData.passengerInfo.dateOfBirth.trim()) {
      errors['passengerInfo.dateOfBirth'] = 'Date of birth is required';
    } else {
      // Ensure the passenger is at least 18 years old
      const dob = new Date(formData.passengerInfo.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (age < 18 || (age === 18 && monthDiff < 0)) {
        errors['passengerInfo.dateOfBirth'] = 'Passenger must be at least 18 years old';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Process payment form submission
   * @param fetchWithAuth - Auth-enabled fetch function
   * @param bookingId - Current booking ID
   * @param onSuccess - Callback for successful submission
   * @param onError - Callback for submission error
   */
  const submitPaymentForm = async (
    fetchWithAuth: any,
    bookingId: string,
    onSuccess?: (data: any) => void,
    onError?: (error: Error) => void
  ) => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      // Add null checks before using replace method
      const cardNumber = formData.cardNumber ? formData.cardNumber.replace(/\s/g, '') : '';
      
      // Parse expiry date safely
      let expiryMonth = '';
      let expiryYear = '';
      
      if (formData.expiryDate && formData.expiryDate.includes('/')) {
        const [month, year] = formData.expiryDate.split('/');
        expiryMonth = month;
        expiryYear = year ? `20${year}` : '';
      }

      // Prepare payment data for API with correct field names
      const paymentInfo = {
        number: cardNumber,
        name: formData.cardholderName || '',
        expiryMonth,
        expiryYear,
        cvv: formData.cvv || '',
        passengerInfo: {
          firstName: formData.passengerInfo?.firstName || '',
          lastName: formData.passengerInfo?.lastName || '',
          email: formData.passengerInfo?.email || '',
          passportNumber: formData.passengerInfo?.passportNumber || '',
          dateOfBirth: formData.passengerInfo?.dateOfBirth || ''
        }
      };

      // Submit to API
      const response = await fetchWithAuth('/api/bookings/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          paymentInfo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Checkout failed');
      }

      // Handle success
      setSuccessMessage('Booking completed successfully!');
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return true;
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during checkout';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    formErrors,
    isSubmitting,
    error,
    successMessage,
    setFormData,
    setFormErrors,
    setIsSubmitting,
    setError,
    setSuccessMessage,
    handleInputChange,
    handleCardNumberChange,
    handleExpiryDateChange,
    validateForm,
    submitPaymentForm
  };
}