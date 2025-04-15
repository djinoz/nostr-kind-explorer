/**
 * Event Display Module
 * Handles displaying events in the UI
 */

/**
 * Display events in the UI
 * @param {Object} kindGroups - Object with events grouped by kind
 * @param {string|number} selectedKind - The selected kind to display, or 'all' for all kinds
 */
function displayEvents(kindGroups, selectedKind) {
  const eventsContainer = document.getElementById('events-container');
  if (!eventsContainer) return;
  
  // Clear the container
  eventsContainer.innerHTML = '';
  
  // If there are no events, show a message
  if (Object.keys(kindGroups).length === 0) {
    const noEventsMessage = document.createElement('p');
    noEventsMessage.textContent = 'No events found.';
    eventsContainer.appendChild(noEventsMessage);
    return;
  }
  
  // Get the events to display
  let eventsToDisplay = [];
  
  if (selectedKind === 'all') {
    // Display all events, sorted by created_at (newest first)
    const allEvents = [];
    Object.values(kindGroups).forEach(events => {
      allEvents.push(...events);
    });
    
    eventsToDisplay = allEvents.sort((a, b) => b.created_at - a.created_at);
  } else {
    // Display events of the selected kind
    const kind = parseInt(selectedKind, 10);
    eventsToDisplay = kindGroups[kind] || [];
  }
  
  // If there are no events to display, show a message
  if (eventsToDisplay.length === 0) {
    const noEventsMessage = document.createElement('p');
    noEventsMessage.textContent = 'No events found for the selected kind.';
    eventsContainer.appendChild(noEventsMessage);
    return;
  }
  
  // Display the events
  eventsToDisplay.forEach(event => {
    const eventElement = createEventElement(event);
    eventsContainer.appendChild(eventElement);
  });
}

/**
 * Create an HTML element for an event
 * @param {Object} event - Nostr event object
 * @returns {HTMLElement} The event element
 */
function createEventElement(event) {
  const eventElement = document.createElement('div');
  eventElement.className = 'event';
  
  // Create the event header
  const eventHeader = document.createElement('div');
  eventHeader.className = 'event-header';
  
  // Format the timestamp
  const timestamp = formatTimestamp(event.created_at);
  
  // Get the kind name
  const kindName = getKindName(event.kind);
  
  // Set the header text
  eventHeader.textContent = `${timestamp} - Kind ${event.kind} (${kindName})`;
  
  // Create the event content
  const eventContent = document.createElement('pre');
  eventContent.className = 'event-content';
  eventContent.textContent = formatEventJson(event);
  
  // Add the header and content to the event element
  eventElement.appendChild(eventHeader);
  eventElement.appendChild(eventContent);
  
  return eventElement;
}

/**
 * Show the loading status section
 */
function showLoadingStatus() {
  const statusSection = document.getElementById('status-section');
  const resultsSection = document.getElementById('results-section');
  const errorSection = document.getElementById('error-section');
  
  if (statusSection) statusSection.style.display = 'block';
  if (resultsSection) resultsSection.style.display = 'none';
  if (errorSection) errorSection.style.display = 'none';
}

/**
 * Show the results section
 */
function showResults() {
  const statusSection = document.getElementById('status-section');
  const resultsSection = document.getElementById('results-section');
  const errorSection = document.getElementById('error-section');
  
  if (statusSection) statusSection.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'block';
  if (errorSection) errorSection.style.display = 'none';
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
  const statusSection = document.getElementById('status-section');
  const resultsSection = document.getElementById('results-section');
  const errorSection = document.getElementById('error-section');
  const errorMessage = document.getElementById('error-message');
  
  if (statusSection) statusSection.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'none';
  if (errorSection) errorSection.style.display = 'block';
  if (errorMessage) errorMessage.textContent = message;
}

/**
 * Reset the UI to its initial state
 */
function resetUI() {
  const statusSection = document.getElementById('status-section');
  const resultsSection = document.getElementById('results-section');
  const errorSection = document.getElementById('error-section');
  
  if (statusSection) statusSection.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'none';
  if (errorSection) errorSection.style.display = 'none';
  
  // Reset the progress bar
  const progressElement = document.getElementById('fetch-progress');
  if (progressElement) progressElement.value = 0;
  
  // Reset the status message
  const statusMessage = document.getElementById('status-message');
  if (statusMessage) statusMessage.textContent = 'Fetching events...';
  
  // Reset the connected relays
  const connectedRelays = document.getElementById('connected-relays');
  if (connectedRelays) connectedRelays.textContent = 'Connected relays: 0/0';
  
  // Reset the events found
  const eventsFound = document.getElementById('events-found');
  if (eventsFound) eventsFound.textContent = 'Events found: 0';
  
  // Reset the total events
  const totalEvents = document.getElementById('total-events');
  if (totalEvents) totalEvents.textContent = 'Total events: 0';
  
  // Reset the unique kinds
  const uniqueKinds = document.getElementById('unique-kinds');
  if (uniqueKinds) uniqueKinds.textContent = 'Unique kinds: 0';
  
  // Reset the kind dropdown
  const kindDropdown = document.getElementById('kind-dropdown');
  if (kindDropdown) {
    // Clear all options except the first one
    while (kindDropdown.options.length > 1) {
      kindDropdown.remove(1);
    }
  }
  
  // Clear the events container
  const eventsContainer = document.getElementById('events-container');
  if (eventsContainer) eventsContainer.innerHTML = '';
}
