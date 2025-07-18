import { ChevronDown, CloudDownload, MapPin } from "lucide-react";
import React, { useState } from "react";
import Map from "./Map";
import CrimeDetailsSection from "./CrimeDetails";

function CrimeMap() {
  const [filters, setFilters] = useState({
    location: "Select Location",
    dateRange: "Last 7 Days",
    crimeType: "Rape",
    sourceChannel: "Mobile"
  });
  const [selectedLga, setSelectedLga] = useState("")

  const [openDropdown, setOpenDropdown] = useState(null);

  const filterOptions = {
    location: ["Select Location", "Lagos", "Abuja", "Kano", "Rivers", "Ogun"],
    dateRange: ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last Year", "Custom Range"],
    crimeType: ["Rape", "Robbery", "Kidnapping", "Fraud", "Assault", "Burglary"],
    sourceChannel: ["Mobile", "Web", "Desktop", "API", "SMS"]
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setOpenDropdown(null);
  };

  const toggleDropdown = (filterType) => {
    setOpenDropdown(openDropdown === filterType ? null : filterType);
  };

  const FilterDropdown = ({ type, label, icon }) => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(type)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
      >
        {icon && <span className="text-gray-500">{icon}</span>}
        <span className="text-gray-700 text-sm">{filters[type]}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openDropdown === type ? 'rotate-180' : ''}`} />
      </button>
      
      {openDropdown === type && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {filterOptions[type].map((option, index) => (
            <button
              key={index}
              onClick={() => handleFilterChange(type, option)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 first:rounded-t-md last:rounded-b-md"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 bg-white p-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span>Dashboard</span>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span>Crime Map</span>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span className="text-gray-900">Map</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 px-3">
        <div>
          <h1 className="font-semibold text-[24px]">Crime Map</h1>
          <span className="text-[#535862]">Here's an overview of your site traffic and recently active users.</span>
        </div>
        <div className="flex gap-2 border-solid border-[1px] border-[#D5D7DA] px-4 py-2 rounded-sm cursor-pointer hover:bg-gray-50">
          <CloudDownload />
          <p>Export Report</p>
        </div>
      </div>

      

      {/* Map placeholder */}
      <div className="mt-6 px-3">
        <Map selectedLga={selectedLga} setSelectedLga={setSelectedLga}/>
      </div>

      <div>
        <CrimeDetailsSection selectedLga={selectedLga} setSelectedLga={setSelectedLga}/>
      </div>
    </div>
  );
}

export default CrimeMap;