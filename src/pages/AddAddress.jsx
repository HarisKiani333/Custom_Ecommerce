import React, { useState } from "react";

const InputField = ({
  className,
  type,
  placeholder,
  name,
  value,
  handleChange,
}) => (
  <input
    className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${className}`}
    type={type}
    placeholder={placeholder}
    name={name}
    onChange={handleChange}
    value={value}
    required
  />
);

const AddAddress = () => {
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

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    console.log("Form Submitted", address);
  };

  return (
    <div className="mt-24 pb-16 px-4 md:px-12">
      <p className="text-2xl md:text-3xl text-gray-500 mb-6">
        Add Shipping{" "}
        <span className="font-semibold text-green-600">Address</span>
      </p>

      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Right: Form */}
        <div className="w-full md:w-1/2">
          <form
            onSubmit={onSubmitHandler}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
          >
            <InputField
              name="firstName"
              placeholder="First Name"
              type="text"
              value={address.firstName}
              handleChange={handleChange}
            />
            <InputField
              name="lastName"
              placeholder="Last Name"
              type="text"
              value={address.lastName}
              handleChange={handleChange}
            />
            <InputField
              name="email"
              placeholder="Email Address"
              type="email"
              value={address.email}
              handleChange={handleChange}
            />
            <InputField
              name="phone"
              placeholder="Phone"
              type="number"
              required
              pattern="[0-9]{10}"
              value={address.phone}
              handleChange={handleChange}
            />

            <InputField
              name="address"
              placeholder="Street Address"
              type="text"
              value={address.address}
              handleChange={handleChange}
            />
            <InputField
              name="city"
              placeholder="City"
              type="text"
              value={address.city}
              handleChange={handleChange}
            />
            <InputField
              name="state"
              placeholder="State"
              type="text"
              value={address.state}
              handleChange={handleChange}
            />
            <InputField
              name="zip"
              placeholder="ZIP Code"
              type="text"
              value={address.zip}
              handleChange={handleChange}
            />
            <InputField
              className="w-full col-span-2"
              name="country"
              placeholder="Country"
              type="text"
              value={address.country}
              handleChange={handleChange}
            />

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>

        {/* Left: Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <svg
            className="w-[280px] md:w-[350px] lg:w-[420px] text-green-600 transition-all hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;
