'use strict';
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");

// Open the navigation menu
navOpenBtn.addEventListener("click", () => {
  navbar.classList.add("active");
  overlay.classList.add("active");
});

// Close the navigation menu
navCloseBtn.addEventListener("click", () => {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
});

// Close the menu if the overlay is clicked
overlay.addEventListener("click", () => {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
});



const goTopBtn = document.querySelector('.go-top-btn');

window.addEventListener('scroll', () => {
  if (window.scrollY >300 ) {  // Show after scrolling 200px
    goTopBtn.style.display = 'block';
  } else {
    goTopBtn.style.display = 'none';
  }
});

goTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});



let apartmentsData = [];

// Show the budget and state input fields
document.getElementById('budgetButton').addEventListener('click', function() {
  var inputDiv = document.getElementById('budgetInputDiv');
  inputDiv.style.maxHeight = inputDiv.scrollHeight + "px"; // Expand the height smoothly
  inputDiv.style.opacity = 1; // Make it fully visible
});

// Handle CSV file upload
document.getElementById('csvFileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  
  if (file && file.name.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      complete: function(results) {
        apartmentsData = results.data; // Store the parsed apartment data
        populateDropdown(apartmentsData); // Populate dropdown with states
      },
      error: function(error) {
        console.error("Error parsing CSV file:", error);
      }
    });
  } else {
    alert('Please upload a valid CSV file.');
  }
});

// Populate the dropdown with unique states
function populateDropdown(data) {
  const stateSelect = document.getElementById('stateSelect');
  const states = data.map(row => row.state); // Assuming 'state' is the correct column name
  const uniqueStates = [...new Set(states)];

  // Clear existing options
  stateSelect.innerHTML = '<option value="" disabled selected>Select your state</option>';

  uniqueStates.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
}

// Handle budget and state selection
document.getElementById('submitBudget').addEventListener('click', function() {
  const budget = parseFloat(document.getElementById('budgetInput').value);
  const selectedState = document.getElementById('stateSelect').value;

  if (!budget || !selectedState) {
    alert('Please enter a valid budget and select a state.');
    return;
  }
  
  // Filter apartments based on exact budget and state
  const filteredApartments = filterApartments(budget, selectedState);

  // Perform binary search to find the apartments matching the exact budget
  const foundApartments = binarySearchApartments(filteredApartments, budget);

  // Display the results
  displayResults(foundApartments);
});

// Filter apartments based on the exact state
function filterApartments(budget, state) {
  return apartmentsData
    .filter(apartment => apartment.state === state) // Filter by state
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); // Sort by price (ascending)
}

// BinarySearchAlgoritm
function binarySearchApartments(apartments, budget) {
  let low = 0;
  let high = apartments.length - 1;
  let result = [];

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    let price = parseFloat(apartments[mid].price);

    if (price === budget) {
      result.push(apartments[mid]); // Add the current apartment if the price matches exactly

      // Check for other apartments with the same price (left and right of mid)
      for (let i = mid - 1; i >= low && parseFloat(apartments[i].price) === budget; i--) {
        result.unshift(apartments[i]); // Add to the start
      }
      for (let i = mid + 1; i <= high && parseFloat(apartments[i].price) === budget; i++) {
        result.push(apartments[i]); // Add to the end
      }
      break;
      
    } else if (price > budget) {
      high = mid - 1; 
      low = mid + 1;
    }
  }

  return result;
}

// Display the search results in the DOM
function displayResults(apartments) {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = ''; // Clear any previous results

  if (apartments.length === 0) {
    resultsList.innerHTML = '<li>No apartments found with the exact price in the selected state.</li>';
    return;
  }

  apartments.forEach(apartment => {
    const listItem = document.createElement('li');
    listItem.textContent = `${apartment.street}, ${apartment.city} - $${apartment.price} in ${apartment.state}`; // Adjust keys as per your CSV data
    resultsList.appendChild(listItem);
  });
}
function displayResults(apartments) {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = ''; // Clear any previous results

  if (apartments.length === 0) {
    const noResults = document.createElement('tr');
    noResults.innerHTML = '<td colspan="6">No apartments found with the exact price in the selected state.</td>';
    resultsList.appendChild(noResults);
    return;
  }

  apartments.forEach(apartment => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Street">${apartment.street}</td>
      <td data-label="City">${apartment.city}</td>
      <td data-label="State">${apartment.state}</td>
      <td data-label="Price">$${apartment.price}</td>
 
    `;
    resultsList.appendChild(row);
  });
}
