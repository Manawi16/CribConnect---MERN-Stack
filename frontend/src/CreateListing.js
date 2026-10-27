// src/CreateListing.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateListing.css';
import axios from 'axios'; 
import { FaChevronRight, FaChevronLeft, FaUpload } from 'react-icons/fa';
import { useModal } from './ModalContext'; // Import the modal hook

let debounceTimer=null;
function CreateListing() {
  const navigate = useNavigate();
  const { showModal } = useModal(); // Use the modal hook
  const [step, setStep] = useState(1);
  const [pincode, setPincode] = useState('');
  const [latLng, setLatLng] = useState({ lat: '28.7163', lng: '77.1032' });
  const [city, setCity] = useState('New Delhi');
  const [areaInput, setAreaInput] = useState('');
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');

  const [formData, setFormData] = useState({
    place_id:"",
    title: '',
    description: '',
    address: { flat: '', area: areaInput, city: city, state: 'Delhi', pincode: '' },
    price: '',
    category: 'flat',
    bhk: 1,
    bathrooms: 1,
    furnishing: 'none',
    sharing: 1,
    amenities: { ac: false, wifi: false, lift: false, water_purifier: false, stove: false, inverter: false, fridge: false, washing_machine: false },
    mess_included_veg: false,
    mess_included_nonveg: false,
    images: [],
    lease_type: 'bachelor',
    gender: 'null',
    landlord_requirements: { drink: false, smoke: false, food_type: 'null' },
    negotiation: false,
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/create-listing/location?pincode=${pincode}`);
        setCity(data.city || '');
        setLatLng({ lat: data.lat, lng: data.lng });
      } catch (err) {
        console.error("Invalid Pincode:", err);
      }
    };
    if (pincode.length === 6) {
      fetchLocation();
    } else {
      setCity('');
    }
  }, [pincode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };
  
  const handleAreaChange = (e) => {
    const input = e.target.value;
    setAreaInput(input);
    if (debounceTimer) clearTimeout(debounceTimer); 
    debounceTimer = setTimeout(async () => {
      if (input.trim().length < 3) {
        setAreaSuggestions([]);
        return;
      }
      try {
        const { data } = await axios.get(`http://localhost:5000/api/tenant-autocomplete?input=${input}&lat=${latLng.lat}&lng=${latLng.lng}`);
        setAreaSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Area autocomplete error:", err);
        setAreaSuggestions([]);
      }
    }, 500); 
  };

  const handleNestedChange = (parent, e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [name]: val }
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previewsArray]);
    }
  };
  
  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title) newErrors.title = "Title is required.";
      if (!areaInput) newErrors.area = "Area/Locality is required.";
      if (!formData.price || formData.price <= 0) newErrors.price = "A valid price is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSelect = (suggestion) => {
    setAreaInput(suggestion.description);
    setAreaSuggestions([]);
    setSelectedPlaceId(suggestion.place_id);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        area: suggestion.description
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const form = new FormData();
    form.append("place_id", selectedPlaceId);
    // Append all other form data fields...
    Object.keys(formData).forEach(key => {
        if (key === 'images') {
            formData.images.forEach(image => form.append('images', image));
        } else if (typeof formData[key] === 'object' && formData[key] !== null) {
            Object.keys(formData[key]).forEach(subKey => {
                form.append(`${key}[${subKey}]`, formData[key][subKey]);
            });
        } else {
            form.append(key, formData[key]);
        }
    });

    try {
      const res = await axios.post('http://localhost:5000/api/create-listings', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      showModal({
        message: 'Listing created successfully!',
        onConfirm: () => navigate('/listings')
      });
    } catch (err) {
      console.error(err);
      showModal({ message: 'Error submitting listing. Please check the details and try again.' });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Title*</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., 2 BHK Apartment in Saket" />
              {errors.title && <p className="error-message">{errors.title}</p>}
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Tell tenants about your property..."></textarea>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Category*</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="flat">Flat</option>
                  <option value="pg">PG</option>
                  <option value="room">Room</option>
                  <option value="property">Property</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price (per month)*</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g., 25000" />
                {errors.price && <p className="error-message">{errors.price}</p>}
              </div>
            </div>
            <h4>Address</h4>
            <div className="form-grid">
              <div className="form-group"><label>Flat/House No.</label><input type="text" name="flat" value={formData.address.flat} onChange={(e) => handleNestedChange('address', e)} /></div>
              <div className="form-group autocomplete-wrapper">
                <label>Area/Locality*</label>
                <input
                  type="text"
                  name="area"
                  value={areaInput}
                  onChange={handleAreaChange}
                  placeholder="e.g., Saket, Rohini..."
                />
                {areaSuggestions.length > 0 && (
                  <ul className="autocomplete-suggestions">
                    {areaSuggestions.map((s, i) => (
                      <li key={i} onClick={() => handleSelect(s)}>
                        {s.description}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.area && <p className="error-message">{errors.area}</p>}
              </div>
              <div className="form-group"><label>Pincode</label><input type="text" name="pincode" value={formData.address.pincode} onChange={(e) => {setPincode(e.target.value);handleNestedChange('address', e)}} /></div>
              <div className="form-group"><label>City</label><input type="text" name="city" value={city} disabled /></div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2>Property Details & Amenities</h2>
            <div className="form-grid">
              <div className="form-group"><label>BHK</label><input type="number" name="bhk" value={formData.bhk} onChange={handleInputChange} min="1" /></div>
              <div className="form-group"><label>Bathrooms</label><input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} min="1" /></div>
              <div className="form-group"><label>Sharing</label><input type="number" name="sharing" value={formData.sharing} onChange={handleInputChange} min="1" /></div>
              <div className="form-group"><label>Furnishing</label><select name="furnishing" value={formData.furnishing} onChange={handleInputChange}><option value="none">None</option><option value="semi">Semi</option><option value="full">Full</option></select></div>
            </div>
            <h4>Amenities</h4>
            <div className="checkbox-grid">
              <label><input type="checkbox" name="ac" checked={formData.amenities.ac} onChange={(e) => handleNestedChange('amenities', e)} /> AC</label>
              <label><input type="checkbox" name="wifi" checked={formData.amenities.wifi} onChange={(e) => handleNestedChange('amenities', e)} /> Wi-Fi</label>
              <label><input type="checkbox" name="lift" checked={formData.amenities.lift} onChange={(e) => handleNestedChange('amenities', e)} /> Lift</label>
              <label><input type="checkbox" name="water_purifier" checked={formData.amenities.water_purifier} onChange={(e) => handleNestedChange('amenities', e)} /> Water Purifier</label>
              <label><input type="checkbox" name="stove" checked={formData.amenities.stove} onChange={(e) => handleNestedChange('amenities', e)} /> Stove</label>
              <label><input type="checkbox" name="inverter" checked={formData.amenities.inverter} onChange={(e) => handleNestedChange('amenities', e)} /> Power Backup</label>
              <label><input type="checkbox" name="fridge" checked={formData.amenities.fridge} onChange={(e) => handleNestedChange('amenities', e)} /> Fridge</label>
              <label><input type="checkbox" name="washing_machine" checked={formData.amenities.washing_machine} onChange={(e) => handleNestedChange('amenities', e)} /> Washing Machine</label>
            </div>
            <h4>Mess Included</h4>
            <div className="checkbox-grid">
              <label><input type="checkbox" name="mess_included_veg" checked={formData.mess_included_veg} onChange={handleInputChange} /> Veg</label>
              <label><input type="checkbox" name="mess_included_nonveg" checked={formData.mess_included_nonveg} onChange={handleInputChange} /> Non-Veg</label>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2>Photos & Rules</h2>
            <div className="form-group">
              <label>Upload Photos</label>
              <label htmlFor="image-upload" className="file-upload-label"><FaUpload /> Choose Images</label>
              <input type="file" id="image-upload" multiple accept="image/png, image/jpeg" onChange={handleImageChange} />
              <div className="image-previews">
                {imagePreviews.map((src, i) => <img key={i} src={src} alt="Upload preview" />)}
              </div>
            </div>
            <h4>Tenant Rules</h4>
            <div className="form-grid">
              <div className="form-group"><label>Lease Type</label><select name="lease_type" value={formData.lease_type} onChange={handleInputChange}><option value="bachelor">Bachelor</option><option value="family">Family</option><option value="professional">Professional</option></select></div>
              <div className="form-group"><label>Preferred Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange}><option value="null">Any</option><option value="m">Male</option><option value="f">Female</option><option value="coed">Co-ed</option></select></div>
              <div className="form-group"><label>Food Preference</label><select name="food_type" value={formData.landlord_requirements.food_type} onChange={(e) => handleNestedChange('landlord_requirements', e)}><option value="any">Any</option><option value="veg">Veg</option><option value="non-veg">Non-Veg</option></select></div>
            </div>
            <div className="checkbox-grid">
              <label><input type="checkbox" name="negotiation" checked={formData.negotiation} onChange={handleInputChange} /> Price is Negotiable</label>
              <label><input type="checkbox" name="drink" checked={formData.landlord_requirements.drink} onChange={(e) => handleNestedChange('landlord_requirements', e)} /> Drinking Allowed</label>
              <label><input type="checkbox" name="smoke" checked={formData.landlord_requirements.smoke} onChange={(e) => handleNestedChange('landlord_requirements', e)} /> Smoking Allowed</label>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-listing-page">
      <form className="create-listing-form" onSubmit={handleSubmit}>
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>Info</div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>Details</div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>Rules</div>
        </div>
        <div className="form-content">
          {renderStep()}
        </div>
        <div className="form-navigation">
          {step > 1 && <button type="button" onClick={prevStep} className="nav-btn prev"><FaChevronLeft /> Back</button>}
          {step < 3 && <button type="button" onClick={nextStep} className="nav-btn next">Next <FaChevronRight /></button>}
          {step === 3 && <button type="submit" className="nav-btn submit">Create Listing</button>}
        </div>
      </form>
    </div>
  );
}

export default CreateListing;