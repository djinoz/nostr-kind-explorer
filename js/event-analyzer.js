/**
 * Event Analyzer Module
 * Handles analyzing and grouping events by kind
 */

/**
 * Analyze events and group them by kind
 * @param {Object[]} events - Array of Nostr events
 * @returns {Object} Object with events grouped by kind and statistics
 */
function analyzeEvents(events) {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return {
      kindGroups: {},
      stats: {
        totalEvents: 0,
        uniqueKinds: 0
      }
    };
  }
  
  // Group events by kind
  const kindGroups = {};
  
  events.forEach(event => {
    const kind = event.kind;
    
    if (!kindGroups[kind]) {
      kindGroups[kind] = [];
    }
    
    kindGroups[kind].push(event);
  });
  
  // Sort events within each group by created_at (newest first)
  Object.values(kindGroups).forEach(group => {
    group.sort((a, b) => b.created_at - a.created_at);
  });
  
  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    uniqueKinds: Object.keys(kindGroups).length
  };
  
  return {
    kindGroups,
    stats
  };
}

/**
 * Get sorted kind numbers from kind groups
 * @param {Object} kindGroups - Object with events grouped by kind
 * @returns {number[]} Array of kind numbers sorted numerically
 */
function getSortedKinds(kindGroups) {
  return Object.keys(kindGroups)
    .map(kind => parseInt(kind, 10))
    .sort((a, b) => a - b);
}

/**
 * Update the statistics display in the UI
 * @param {Object} stats - Statistics object
 */
function updateStatsDisplay(stats) {
  const totalEventsElement = document.getElementById('total-events');
  if (totalEventsElement) {
    totalEventsElement.textContent = `Total events: ${stats.totalEvents}`;
  }
  
  const uniqueKindsElement = document.getElementById('unique-kinds');
  if (uniqueKindsElement) {
    uniqueKindsElement.textContent = `Unique kinds: ${stats.uniqueKinds}`;
  }
}

/**
 * Populate the kind dropdown with options
 * @param {Object} kindGroups - Object with events grouped by kind
 */
function populateKindDropdown(kindGroups) {
  const dropdown = document.getElementById('kind-dropdown');
  if (!dropdown) return;
  
  // Clear existing options except the "All Kinds" option
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }
  
  // Get sorted kinds
  const sortedKinds = getSortedKinds(kindGroups);
  
  // Add an option for each kind
  sortedKinds.forEach(kind => {
    const option = document.createElement('option');
    option.value = kind;
    
    // Get the friendly name for this kind
    const kindName = getKindName(kind);
    const count = kindGroups[kind].length;
    
    option.textContent = `${kind} - ${kindName} (${count})`;
    dropdown.appendChild(option);
  });
}

/**
 * Format a timestamp as a human-readable date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Format an event as a JSON string with proper indentation
 * @param {Object} event - Nostr event object
 * @returns {string} Formatted JSON string
 */
function formatEventJson(event) {
  return JSON.stringify(event, null, 2);
}

/**
 * Get a summary of an event's content
 * @param {Object} event - Nostr event object
 * @returns {string} Summary of the event content
 */
function getEventSummary(event) {
  if (event.kind === 1) {
    // For text notes, return a preview of the content
    return event.content.length > 100
      ? event.content.substring(0, 100) + '...'
      : event.content;
  }
  
  if (event.kind === 0) {
    // For metadata, try to parse the content as JSON and return the name
    try {
      const metadata = JSON.parse(event.content);
      return metadata.name || metadata.display_name || 'Metadata';
    } catch (error) {
      return 'Metadata';
    }
  }
  
  // For other kinds, return the kind name
  return getKindName(event.kind);
}
