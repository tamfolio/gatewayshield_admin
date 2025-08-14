import React, { useRef, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = "AIzaSyALniH6V8qHvDGFQzIM6dAWetIwQbx6ueU";

// Ogun State bounds
const OGUN_STATE_BOUNDS = {
  north: 7.8,
  south: 6.2,
  east: 4.3,
  west: 2.5
};

// Check if coordinates are within Ogun State bounds
export const isCoordinateInOgunState = (latitude, longitude) => {
  return latitude >= OGUN_STATE_BOUNDS.south && 
         latitude <= OGUN_STATE_BOUNDS.north &&
         longitude >= OGUN_STATE_BOUNDS.west && 
         longitude <= OGUN_STATE_BOUNDS.east;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Enhanced station fetcher for Ogun State using your working API
export const fetchOgunStateStations = async (latitude, longitude) => {
  console.log(`🔍 Searching for Ogun State stations near: ${latitude}, ${longitude}`);
  
  try {
    // Use your working API endpoint
    const url = `https://admin-api.thegatewayshield.com/api/v1/feedback/caseReview/stations?longitude=${longitude}&latitude=${latitude}`;
    console.log("🌐 Fetching stations from:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if needed
        // 'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📊 Stations API response:", data);
    
    if (data.data && data.data.nearbyStations && Array.isArray(data.data.nearbyStations)) {
      // Use the nearbyStations array which already has distance calculated
      const stations = data.data.nearbyStations.map((station) => ({
        label: `${station.formation} (${station.distance.toFixed(1)}km away)`,
        value: station.id,
        latitude: null, // API doesn't provide coordinates in nearbyStations
        longitude: null,
        distance: station.distance,
        formation: station.formation,
        address: station.address,
        isFromAPI: true
      }));
      
      console.log(`✅ Found ${stations.length} nearby stations from API:`, stations);
      return stations;
    }
    
    // Fallback to main stations array if nearbyStations is empty
    if (data.data && data.data.stations && Array.isArray(data.data.stations)) {
      console.log("🔄 Using main stations array as fallback");
      
      // Filter for Ogun State stations and calculate distance
      const ogunStations = data.data.stations
        .filter(station => {
          // Filter by formation names that indicate Ogun State locations
          const formation = (station.formation || '').toLowerCase();
          const address = (station.address || '').toLowerCase();
          
          return formation.includes('abeokuta') || 
                 formation.includes('ijebu') || 
                 formation.includes('sagamu') || 
                 formation.includes('ilaro') || 
                 formation.includes('ota') || 
                 formation.includes('sango') ||
                 formation.includes('egbado') ||
                 formation.includes('remo') ||
                 formation.includes('imeko') ||
                 formation.includes('ipokia') ||
                 formation.includes('ogun') ||
                 address.includes('ogun');
        })
        .map(station => ({
          label: `${station.formation}`,
          value: station.id,
          latitude: null,
          longitude: null,
          distance: 0, // No distance calculation available for main list
          formation: station.formation,
          address: station.address,
          isFromAPI: true
        }))
        .slice(0, 10); // Limit to 10 stations
      
      console.log(`✅ Found ${ogunStations.length} Ogun State stations from main list:`, ogunStations);
      return ogunStations;
    }
    
    console.log("❌ No stations found in API response");
    return [];
    
  } catch (error) {
    console.error("❌ Error fetching Ogun State stations:", error);
    throw error;
  }
};

// Enhanced address autocomplete component specific to Ogun State
export const OgunStateAddressAutocomplete = ({ value, onChange, disabled, placeholder, onPlaceSelect }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.log('Google Maps API not loaded yet');
      return;
    }

    if (!inputRef.current || disabled) return;

    // Initialize autocomplete with Ogun State bias
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'ng' },
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(OGUN_STATE_BOUNDS.south, OGUN_STATE_BOUNDS.west),
          new window.google.maps.LatLng(OGUN_STATE_BOUNDS.north, OGUN_STATE_BOUNDS.east)
        ),
        strictBounds: false, // Allow some flexibility
        fields: ['formatted_address', 'geometry', 'address_components', 'name']
      }
    );

    const handlePlaceChanged = () => {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        console.log('No geometry for place:', place.name);
        return;
      }

      const { lat, lng } = place.geometry.location;
      const latitude = lat();
      const longitude = lng();
      
      // Check if place is in Nigeria
      const isInNigeria = place.address_components?.some(component =>
        component.types.includes('country') && component.short_name === 'NG'
      );

      if (!isInNigeria) {
        alert('Please select an address in Nigeria');
        return;
      }

      // Check if place is in Ogun State
      const isInOgunState = place.address_components?.some(component =>
        component.types.includes('administrative_area_level_1') && 
        (component.long_name.toLowerCase().includes('ogun') || 
         component.short_name.toLowerCase().includes('ogun'))
      ) || isCoordinateInOgunState(latitude, longitude);

      if (!isInOgunState) {
        const confirmChoice = window.confirm(
          'This address appears to be outside Ogun State. Do you want to continue with this location?'
        );
        
        if (!confirmChoice) {
          return;
        }
      }

      const addressData = {
        formatted_address: place.formatted_address,
        coordinates: { latitude, longitude },
        place: place,
        isInOgunState: isInOgunState
      };

      if (onChange) {
        onChange({ target: { value: place.formatted_address } });
      }

      if (onPlaceSelect) {
        onPlaceSelect(addressData);
      }
    };

    autocompleteRef.current.addListener('place_changed', handlePlaceChanged);

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [disabled, onChange, onPlaceSelect]);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={placeholder || "Start typing your address in Ogun State..."}
      value={value || ''}
      onChange={handleInputChange}
      disabled={disabled}
    />
  );
};

export default OgunStateAddressAutocomplete;