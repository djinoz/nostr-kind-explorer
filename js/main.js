/**
 * Main Application Module
 * Handles the application's main logic and event listeners
 */

// Global state
let currentKindGroups = {};

/**
 * Initialize the application
 */
function initApp() {
  // Set up event listeners
  setupEventListeners();
  
  // Initialize the UI
  resetUI();
  
  // Set default relays in the textarea
  const relaysTextarea = document.getElementById('relays');
  if (relaysTextarea) {
    relaysTextarea.value = DEFAULT_RELAYS.join(', ');
  }
  
  // Set default dates (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  
  if (startDateInput) {
    startDateInput.valueAsDate = thirtyDaysAgo;
  }
  
  if (endDateInput) {
    endDateInput.valueAsDate = today;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Form submission
  const form = document.getElementById('explorer-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // Kind dropdown change
  const kindDropdown = document.getElementById('kind-dropdown');
  if (kindDropdown) {
    kindDropdown.addEventListener('change', handleKindChange);
  }
}

/**
 * Handle form submission
 * @param {Event} event - The form submission event
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  try {
    // Reset the UI
    resetUI();
    
    // Show loading status
    showLoadingStatus();
    
    // Get form values
    const pubkey = document.getElementById('pubkey').value.trim();
    const startDateStr = document.getElementById('start-date').value;
    const endDateStr = document.getElementById('end-date').value;
    const relaysStr = document.getElementById('relays').value;
    const specificKind = document.getElementById('specific-kind').value;
    
    // Validate pubkey
    if (!pubkey) {
      throw new Error('Public key is required');
    }
    
    // Parse dates
    let startDate = null;
    let endDate = null;
    
    if (startDateStr) {
      startDate = new Date(startDateStr);
    }
    
    if (endDateStr) {
      // Set the time to the end of the day
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Parse relays
    const relays = parseRelayList(relaysStr);
    
    if (relays.length === 0) {
      throw new Error('At least one valid relay is required');
    }
    
    // Fetch events
    const events = await fetchEvents({
      pubkey,
      startDate,
      endDate,
      kind: specificKind,
      relays
    });
    
    // Analyze events
    const { kindGroups, stats } = analyzeEvents(events);
    
    // Store the kind groups in the global state
    currentKindGroups = kindGroups;
    
    // Update the UI
    updateStatsDisplay(stats);
    populateKindDropdown(kindGroups);
    displayEvents(kindGroups, 'all');
    
    // Show results
    showResults();
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'An error occurred');
  }
}

/**
 * Handle kind dropdown change
 * @param {Event} event - The change event
 */
function handleKindChange(event) {
  const selectedKind = event.target.value;
  displayEvents(currentKindGroups, selectedKind);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
