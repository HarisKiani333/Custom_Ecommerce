import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const AddressSelector = ({ 
  selectedAddress, 
  onAddressSelect, 
  addresses, 
  onAddressAdded 
}) => {
  const { axios, user, navigate } = useAppContext();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const addNewAddress = async () => {
    try {
      const requiredFields = [
        'firstName',
        'lastName', 
        'email',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'phone',
      ];
      const missingFields = requiredFields.filter(
        field => !newAddress[field].trim()
      );

      if (missingFields.length > 0) {
        return toast.error(
          `Please fill in all required fields: ${missingFields.join(', ')}`
        );
      }

      const { data } = await axios.post('/api/address/add', { address: newAddress });
      if (data.success) {
        toast.success('Address added successfully');
        setNewAddress({
          firstName: '',
          lastName: '',
          email: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
        });
        setShowAddressForm(false);
        onAddressAdded();
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to add address');
    }
  };

  const handleAddressSelect = (addr) => {
    onAddressSelect(addr);
    toast.success('Address selected successfully');
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate('/add-address')}
        className="text-indigo-500 hover:underline cursor-pointer"
      >
        Add Address
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Address Display */}
      <div className="flex justify-between items-start">
        {selectedAddress ? (
          <div className="text-gray-700">
            <p>{selectedAddress.firstName} {selectedAddress.lastName}</p>
            <p>{selectedAddress.address}, {selectedAddress.city}</p>
            <p>{selectedAddress.phone}</p>
          </div>
        ) : (
          <p className="text-gray-500">No address selected</p>
        )}
      </div>

      {/* Address Selection */}
      {addresses && addresses.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Select Address:</h4>
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedAddress?._id === addr._id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleAddressSelect(addr)}
            >
              <p className="font-medium">
                {addr.firstName} {addr.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {addr.address}, {addr.city}, {addr.state} {addr.zip}
              </p>
              <p className="text-sm text-gray-600">{addr.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add New Address Button */}
      <button
        onClick={() => setShowAddressForm(!showAddressForm)}
        className="w-full py-2 px-4 border border-dashed border-gray-400 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors duration-200"
      >
        + Add New Address
      </button>

      {/* Add Address Form */}
      {showAddressForm && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-800">Add New Address</h4>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={newAddress.firstName}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={newAddress.lastName}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newAddress.email}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
          <input
            type="text"
            name="address"
            placeholder="Street Address"
            value={newAddress.address}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={newAddress.city}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={newAddress.state}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="zip"
              placeholder="ZIP Code"
              value={newAddress.zip}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={newAddress.country}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={newAddress.phone}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={addNewAddress}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Add Address
            </button>
            <button
              onClick={() => setShowAddressForm(false)}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;