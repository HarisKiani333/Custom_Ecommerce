import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const InputField = ({ 
  className = "", 
  type, 
  placeholder, 
  name, 
  value, 
  handleChange, 
  error,
  icon: Icon,
  required = true 
}) => (
  <div className="relative">
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        className={`
          w-full px-3 py-3 ${Icon ? 'pl-10' : ''} 
          border border-gray-300 rounded-lg 
          bg-white text-gray-900 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          transition-all duration-200 ease-in-out
          hover:border-gray-400
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={handleChange}
        value={value}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </div>
    {error && (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
);

// Icon components for better UX
const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AddAddress = () => {
  const { axios, user, navigate } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.length < 2) {
          newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        } else {
          delete newErrors[name];
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors[name] = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors[name] = 'Please enter a valid email address';
        } else {
          delete newErrors[name];
        }
        break;
      case 'phone':
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!value.trim()) {
          newErrors[name] = 'Phone number is required';
        } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors[name] = 'Please enter a valid phone number';
        } else {
          delete newErrors[name];
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors[name] = 'Street address is required';
        } else if (value.length < 5) {
          newErrors[name] = 'Please enter a complete address';
        } else {
          delete newErrors[name];
        }
        break;
      case 'city':
      case 'state':
      case 'country':
        if (!value.trim()) {
          newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        } else if (value.length < 2) {
          newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`;
        } else {
          delete newErrors[name];
        }
        break;
      case 'zip':
        if (!value.trim()) {
          newErrors[name] = 'ZIP code is required';
        } else if (value.length < 3) {
          newErrors[name] = 'Please enter a valid ZIP code';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value,
    });
    
    // Real-time validation
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName", "lastName", "email", "phone", 
      "address", "city", "state", "zip", "country"
    ];
    
    const newErrors = {};
    requiredFields.forEach(field => {
      validateField(field, address[field]);
    });
    
    return Object.keys(errors).length === 0;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    Object.keys(address).forEach(field => {
      validateField(field, address[field]);
    });

    if (Object.keys(errors).length > 0) {
      setIsLoading(false);
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (user && user.id) {
        // Logged-in user
        const requestPayload = { userId: user.id, address };
        const { data } = await axios.post("/api/address/add", requestPayload);
        if (data.success) {
          toast.success("Address added successfully!");
          navigate("/cart");
        } else {
          toast.error(data.message || "Error adding address");
        }
      } else {
        // Guest user → save in localStorage
        localStorage.setItem("guestAddress", JSON.stringify(address));
        toast.success("Address saved for guest checkout!");
        navigate("/cart");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Network error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Optional: prefill guest address if returning
    const savedGuestAddress = JSON.parse(localStorage.getItem("guestAddress"));
    if (!user && savedGuestAddress) setAddress(savedGuestAddress);
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <LocationIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Add Shipping Address
          </h1>
 
          {/* Breadcrumb */}
          <nav className="flex justify-center mt-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button 
                  onClick={() => navigate('/cart')}
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
                >
                  Cart
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-green-600">Add Address</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            <form onSubmit={onSubmitHandler} className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-green-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    name="firstName" 
                    placeholder="First Name" 
                    type="text" 
                    value={address.firstName} 
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    icon={UserIcon}
                  />
                  <InputField 
                    name="lastName" 
                    placeholder="Last Name" 
                    type="text" 
                    value={address.lastName} 
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    icon={UserIcon}
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MailIcon className="w-5 h-5 mr-2 text-green-600" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    name="email" 
                    placeholder="Email Address" 
                    type="email" 
                    value={address.email} 
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    icon={MailIcon}
                  />
                  <InputField 
                    name="phone" 
                    placeholder="Phone Number" 
                    type="tel" 
                    value={address.phone} 
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.phone}
                    icon={PhoneIcon}
                  />
                </div>
              </div>

              {/* Address Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <LocationIcon className="w-5 h-5 mr-2 text-green-600" />
                  Address Information
                </h2>
                <div className="space-y-6">
                  <InputField 
                    name="address" 
                    placeholder="Street Address" 
                    type="text" 
                    value={address.address} 
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.address}
                    icon={LocationIcon}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      name="city" 
                      placeholder="City" 
                      type="text" 
                      value={address.city} 
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.city}
                    />
                    <InputField 
                      name="state" 
                      placeholder="State/Province" 
                      type="text" 
                      value={address.state} 
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.state}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      name="zip" 
                      placeholder="ZIP/Postal Code" 
                      type="text" 
                      value={address.zip} 
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.zip}
                    />
                    <InputField 
                      name="country" 
                      placeholder="Country" 
                      type="text" 
                      value={address.country} 
                      handleChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.country}
                      icon={GlobeIcon}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  Back to Cart
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || Object.keys(errors).length > 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-purple-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Address...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">Your Information is Secure</h3>
              <p className="text-sm text-blue-700">
                We use industry-standard encryption to protect your personal information and never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;
