import React, { useState } from 'react';
import { FaAngleDown, FaFilter, FaTimes } from 'react-icons/fa';
import { IoFilterOutline } from "react-icons/io5";

function MoreFiltersModal({ initialFilters, onApply, onClose }) {
  const [filters, setFilters] = useState(initialFilters);

  const handleCheckboxChange = (name) => {
    setFilters(prev => ({ ...prev, [name]: !prev[name] }));
  };
  
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onApply(filters);
    onClose();
  };
  
  const resetFilters = () => {
      const clearedFilters = {
        ...initialFilters,
        bhk: 'null',
        sharing: 'null',
        lease_type: 'null',
        food_type: 'null',
        ac: false,
        wifi: false,
        washing_machine: false,
        fridge: false,
      };
      setFilters(clearedFilters);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content filters-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>More Filters</h2>
          <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="filter-grid">
            <div className="form-group">
              <label>BHK Type</label>
              <select name="bhk" value={filters.bhk} onChange={handleSelectChange}>
                <option value="null">Any</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sharing Type</label>
              <select name="sharing" value={filters.sharing} onChange={handleSelectChange}>
                <option value="null">Any</option>
                <option value="1">Single</option>
                <option value="2">Double</option>
                <option value="3">Triple</option>
              </select>
            </div>
            <div className="form-group">
              <label>Lease Type</label>
              <select name="lease_type" value={filters.lease_type} onChange={handleSelectChange}>
                <option value="null">Any</option>
                <option value="bachelor">Bachelor</option>
                <option value="family">Family</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div className="form-group">
              <label>Food Preference</label>
              <select name="food_type" value={filters.food_type} onChange={handleSelectChange}>
                <option value="null">Any</option>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
          </div>
          <h4>Amenities</h4>
          <div className="checkbox-grid">
            <label><input type="checkbox" name="ac" checked={filters.ac} onChange={() => handleCheckboxChange('ac')} /> AC</label>
            <label><input type="checkbox" name="wifi" checked={filters.wifi} onChange={() => handleCheckboxChange('wifi')} /> Wi-Fi</label>
            <label><input type="checkbox" name="washing_machine" checked={filters.washing_machine} onChange={() => handleCheckboxChange('washing_machine')} /> Washing Machine</label>
            <label><input type="checkbox" name="fridge" checked={filters.fridge} onChange={() => handleCheckboxChange('fridge')} /> Fridge</label>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={resetFilters} className="clear-btn">Clear All</button>
          <button onClick={applyFilters} className="apply-btn">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}


function FilterBar({ filters, onFilterChange, onApplyMoreFilters }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="filter-bar">
        <div className="filter-options">
          <select className="filter-btn" value={filters.gender} onChange={(e) => onFilterChange('gender', e.target.value)}>
            <option value="null">Gender</option>
            <option value="m">Male</option>
            <option value="f">Female</option>
            <option value="coed">Co-ed</option>
          </select>
          <select className="filter-btn" value={filters.verification} onChange={(e) => onFilterChange('verification', e.target.value)}>
            <option value="null">All Listings</option>
            <option value="isVerified">Verified</option>
            <option value="unVerified">Unverified</option>
          </select>
          <select className="filter-btn" value={filters.type} onChange={(e) => onFilterChange('type', e.target.value)}>
            <option value="null">Category</option>
            <option value="flat">Flat</option>
            <option value="pg">PG</option>
            <option value="room">Room</option>
            <option value="property">Property</option>
          </select>
          <div className="filter-divider"></div>
          <button className="filter-btn more-filters" onClick={() => setIsModalOpen(true)}>
            <IoFilterOutline />
            More Filters
          </button>
        </div>
        <div className="sort-by-container">
          <label>Sort:</label>
          <select className="sort-by-select" value={filters.sort} onChange={(e) => onFilterChange('sort', e.target.value)}>
            <option value="new">New</option>
            <option value="rating">Rating</option>
            <option value="asc">Price ascending</option>
            <option value="desc">Price descending</option>
          </select>
        </div>
      </div>
      {isModalOpen && (
        <MoreFiltersModal 
          initialFilters={filters}
          onApply={onApplyMoreFilters}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default FilterBar;