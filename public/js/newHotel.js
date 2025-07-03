
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupNavbarScroll();
  setupScrollAnimations();
  setupFormValidation();
  checkManagerStatus();
  animateStepProgress();
}

// Navbar scroll effect
function setupNavbarScroll() {
  const navbar = document.querySelector('.custom-navbar');
  
  window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
          navbar.classList.add('scrolled');
      } else {
          navbar.classList.remove('scrolled');
      }
  });
}





const apiKey = "5ae2e3f221c38a28845f05b68ecd09f31fa077689f19fb5f4923e567";
let searchTimeout;
const hotelForm = document.getElementById('hotelForm');

// Search functionality - triggered by input event
document.getElementById('hotelQuery').addEventListener('input', function() {
  fetchSuggestions();
});

async function fetchSuggestions() {
  const query = document.getElementById("hotelQuery").value.trim();
  const suggestionList = document.getElementById("suggestionList");

  // Clear previous timeout
  clearTimeout(searchTimeout);

  if (!query) {
    suggestionList.style.display = "none";
    return;
  }

  // Show loading state
  suggestionList.innerHTML = '<div class="loading-item">Searching...</div>';
  suggestionList.style.display = "block";

  // Debounce the search
  searchTimeout = setTimeout(async () => {
    try {
      // First, get coordinates for the location (restricted to India)
      const locationResponse = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(query)}&country=in&apikey=${apiKey}`);
      const locationData = await locationResponse.json();

      if (!locationData || !locationData.lat || !locationData.lon) {
        suggestionList.innerHTML = '<div class="error-item">Indian location not found. Try searching for Indian cities like Mumbai, Delhi, Bangalore, etc.</div>';
        return;
      }

      // Now search for accommodations near this location
      const radius = 5000; // 5km radius
      const accommodationResponse = await fetch(
        `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${locationData.lon}&lat=${locationData.lat}&kinds=accomodations&format=json&apikey=${apiKey}&limit=10`
      );
      const accommodationData = await accommodationResponse.json();

      if (accommodationData && accommodationData.length > 0) {
        // Get detailed information for each place
        const detailedHotels = await Promise.all(
          accommodationData.slice(0, 5).map(async (place) => {
            try {
              const detailResponse = await fetch(
                `https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${apiKey}`
              );
              const detail = await detailResponse.json();
              return {
                name: detail.name || place.name || "Unknown Hotel",
                description: detail.wikipedia_extracts?.text || `Beautiful hotel located in ${locationData.name}`,
                address: detail.address?.road || "",
                city: detail.address?.city || locationData.name || "",
                state: detail.address?.state || locationData.country || "India",
                zipCode: detail.address?.postcode || "",
                latitude: place.point?.lat || locationData.lat,
                longitude: place.point?.lon || locationData.lon
              };
            } catch (error) {
              return {
                name: place.name || "Unknown Hotel",
                description: `Beautiful hotel located in ${locationData.name}`,
                address: "",
                city: locationData.name || "",
                state: "",
                zipCode: "",
                latitude: place.point?.lat || locationData.lat,
                longitude: place.point?.lon || locationData.lon
              };
            }
          })
        );

        displaySuggestions(detailedHotels.filter(hotel => hotel.name !== "Unknown Hotel"));
      } else {
        // If no accommodations found, create sample hotels for the Indian location
        const sampleHotels = [
          {
            name: `Hotel ${locationData.name} Palace`,
            description: `Luxurious palace hotel in the heart of ${locationData.name} with world-class amenities and traditional hospitality.`,
            address: "MG Road",
            city: locationData.name,
            state: "India",
            zipCode: "",
            latitude: locationData.lat,
            longitude: locationData.lon
          },
          {
            name: `${locationData.name} Grand Hotel`,
            description: `Premium grand hotel offering exceptional comfort and modern facilities in ${locationData.name}.`,
            address: "City Center",
            city: locationData.name,
            state: "India",
            zipCode: "",
            latitude: locationData.lat + 0.001,
            longitude: locationData.lon + 0.001
          },
          {
            name: `The ${locationData.name} Inn`,
            description: `Cozy and comfortable inn with personalized service in the main market area of ${locationData.name}.`,
            address: "Main Market",
            city: locationData.name,
            state: "India",
            zipCode: "",
            latitude: locationData.lat - 0.001,
            longitude: locationData.lon - 0.001
          }
        ];
        displaySuggestions(sampleHotels);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      suggestionList.innerHTML = '<div class="error-item">Error searching for hotels. Please try again.</div>';
    }
  }, 500); // 500ms delay
}

function displaySuggestions(suggestions) {
  const suggestionList = document.getElementById("suggestionList");
  suggestionList.innerHTML = "";

  if (suggestions.length === 0) {
    suggestionList.innerHTML = "<div class='error-item'>No hotels found for this Indian location</div>";
    return;
  }

  suggestions.forEach(hotel => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    
    const addressPart = hotel.address ? `${hotel.address}, ` : "";
    const statePart = hotel.state ? `, ${hotel.state}` : "";
    const zipPart = hotel.zipCode ? ` ${hotel.zipCode}` : "";
    
    suggestionItem.innerHTML = `
      <div class="hotel-name">${hotel.name}</div>
      <div class="hotel-address">${addressPart}${hotel.city}${statePart}${zipPart}</div>
    `;
    
    // This is the key part - click event to auto-fill fields
    suggestionItem.addEventListener("click", () => autoFillFields(hotel));
    suggestionList.appendChild(suggestionItem);
  });
}

function autoFillFields(hotel) {
  // Fill all form fields with hotel data
  document.getElementById("name").value = hotel.name || "";
  document.getElementById("description").value = hotel.description || "";
  document.getElementById("address").value = hotel.address || "";
  document.getElementById("city").value = hotel.city || "";
  document.getElementById("state").value = hotel.state || "";
  document.getElementById("zipCode").value = hotel.zipCode || "";
  document.getElementById("latitude").value = hotel.latitude || "";
  document.getElementById("longitude").value = hotel.longitude || "";
  
  // Hide suggestions
  document.getElementById("suggestionList").style.display = "none";
  
  // Clear search field
  document.getElementById("hotelQuery").value = "";
  
  // Trigger visual feedback for filled fields
  animateFilledFields();
}

function animateFilledFields() {
  const fields = ['name', 'description', 'address', 'city', 'state', 'zipCode'];
  fields.forEach((fieldId, index) => {
    const field = document.getElementById(fieldId);
    if (field && field.value) {
      setTimeout(() => {
        field.style.transform = 'scale(1.02)';
        field.style.borderColor = '#10b981';
        setTimeout(() => {
          field.style.transform = 'scale(1)';
          field.style.borderColor = '';
        }, 200);
      }, index * 100);
    }
  });
}

// Hide suggestions when clicking outside
document.addEventListener("click", function(event) {
  const suggestionList = document.getElementById("suggestionList");
  const searchInput = document.getElementById("hotelQuery");
  const searchContainer = searchInput.closest('.input-container');
  
  if (!searchContainer.contains(event.target)) {
    suggestionList.style.display = "none";
  }
});

// // Form submission handling
// hotelForm.addEventListener('submit', function(e) {
//   e.preventDefault();
  
//   const submitBtn = document.querySelector('.submit-btn');
//   const submitText = document.getElementById('submitText');
//   const submitLoader = document.getElementById('submitLoader');
  
//   // Show loading state
//   submitText.style.display = 'none';
//   submitLoader.style.display = 'inline-block';
//   submitBtn.disabled = true;
  
//   // Collect form data
//   const formData = new FormData(this);
//   const data = Object.fromEntries(formData.entries());
  
//   // Simulate API call
//   setTimeout(() => {
//     console.log('Hotel Registration Data:', data);
    
//     // Show success message
//     // alert('Hotel registered successfully! 🎉');
    
//     // Reset form
//     this.reset();
    
//     // Reset button state
//     submitText.style.display = 'inline';
//     submitLoader.style.display = 'none';
//     submitBtn.disabled = false;
    
//     // Clear search
//     document.getElementById('hotelQuery').value = '';
//     document.getElementById('suggestionList').style.display = 'none';
    
//   }, 2000);
// });

// Input validation and enhancement
const requiredFields = document.querySelectorAll('input[required], textarea[required]');
requiredFields.forEach(field => {
  field.addEventListener('blur', function() {
    if (!this.value.trim()) {
      this.style.borderColor = '#ef4444';
      this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    } else {
      this.style.borderColor = '#10b981';
      this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
    }
  });
});

// Zip code validation (Indian postal codes are 6 digits)
const zipCodeField = document.getElementById('zipCode');
zipCodeField.addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '').slice(0, 6);
});

// Auto-resize textarea
const textarea = document.getElementById('description');
textarea.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});