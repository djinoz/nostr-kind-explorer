/**
 * Event Fetcher Module
 * Handles connecting to relays and fetching events
 */

/**
 * Convert npub to hex format if needed
 * @param {string} pubkey - The public key (npub or hex)
 * @returns {string} The public key in hex format
 */
function normalizePublicKey(pubkey) {
  if (!pubkey) {
    throw new Error('Public key is required');
  }
  
  // If it's already a hex key (64 chars)
  if (/^[0-9a-f]{64}$/i.test(pubkey)) {
    return pubkey.toLowerCase();
  }
  
  // If it's an npub
  if (pubkey.startsWith('npub1')) {
    try {
      const { data } = window.NostrTools.nip19.decode(pubkey);
      return data;
    } catch (error) {
      throw new Error('Invalid npub format');
    }
  }
  
  throw new Error('Invalid public key format');
}

/**
 * Create a filter object for fetching events
 * @param {Object} options - Filter options
 * @param {string} options.pubkey - The public key in hex format
 * @param {Date} [options.startDate] - Start date for filtering
 * @param {Date} [options.endDate] - End date for filtering
 * @param {number} [options.kind] - Specific kind to filter by
 * @returns {Object} The filter object for nostr-tools
 */
function createFilter(options) {
  const filter = {
    authors: [options.pubkey],
  };
  
  // Add since filter if startDate is provided
  if (options.startDate) {
    filter.since = Math.floor(options.startDate.getTime() / 1000);
  }
  
  // Add until filter if endDate is provided
  if (options.endDate) {
    filter.until = Math.floor(options.endDate.getTime() / 1000);
  }
  
  // Add kind filter if specified
  if (options.kind !== undefined && options.kind !== null && options.kind !== '') {
    filter.kinds = [parseInt(options.kind, 10)];
  }
  
  return filter;
}

/**
 * Fetch events from a single relay
 * @param {string} relay - The relay URL
 * @param {Object} filter - The filter object
 * @param {Object} eventMap - Map to store events (for deduplication)
 * @param {Object} stats - Object to track statistics
 * @returns {Promise} A promise that resolves when fetching is complete
 */
function fetchFromRelay(relay, filter, eventMap, stats) {
  return new Promise((resolve, reject) => {
    let timeout;
    let hasResolved = false;
    
    try {
      // Set timeout (10 seconds as per spec)
      timeout = setTimeout(() => {
        if (!hasResolved) {
          stats.failedRelays++;
          updateRelayStatus(stats);
          reject(new Error(`Timeout connecting to ${relay}`));
        }
      }, 10000);
      
      // Connect to relay
      const relayInstance = window.NostrTools.relayInit(relay);
      
      relayInstance.on('connect', () => {
        stats.connectedRelays++;
        updateRelayStatus(stats);
      });
      
      relayInstance.on('error', () => {
        if (!hasResolved) {
          stats.failedRelays++;
          updateRelayStatus(stats);
          clearTimeout(timeout);
          hasResolved = true;
          resolve(); // Resolve anyway to continue with other relays
        }
      });
      
      // Connect to the relay
      relayInstance.connect().then(() => {
        // Create a subscription
        const sub = relayInstance.sub([filter]);
        
        // Handle events
        sub.on('event', (event) => {
          // Deduplicate events by ID
          if (!eventMap[event.id]) {
            eventMap[event.id] = event;
            stats.eventCount++;
            updateEventCount(stats.eventCount);
          }
        });
        
        // Handle end of subscription
        sub.on('eose', () => {
          if (!hasResolved) {
            clearTimeout(timeout);
            hasResolved = true;
            
            // Close the relay connection
            relayInstance.close();
            
            resolve();
          }
        });
      }).catch((err) => {
        if (!hasResolved) {
          stats.failedRelays++;
          updateRelayStatus(stats);
          clearTimeout(timeout);
          hasResolved = true;
          console.error(`Error connecting to ${relay}:`, err);
          resolve(); // Resolve anyway to continue with other relays
        }
      });
    } catch (error) {
      if (!hasResolved) {
        stats.failedRelays++;
        updateRelayStatus(stats);
        clearTimeout(timeout);
        hasResolved = true;
        console.error(`Error with relay ${relay}:`, error);
        resolve(); // Resolve anyway to continue with other relays
      }
    }
  });
}

/**
 * Fetch events from multiple relays
 * @param {Object} options - Fetch options
 * @param {string} options.pubkey - The public key (npub or hex)
 * @param {Date} [options.startDate] - Start date for filtering
 * @param {Date} [options.endDate] - End date for filtering
 * @param {number} [options.kind] - Specific kind to filter by
 * @param {string[]} options.relays - Array of relay URLs
 * @returns {Promise<Object[]>} A promise that resolves to an array of events
 */
async function fetchEvents(options) {
  try {
    // Normalize the public key
    const hexPubkey = normalizePublicKey(options.pubkey);
    
    // Create the filter
    const filter = createFilter({
      pubkey: hexPubkey,
      startDate: options.startDate,
      endDate: options.endDate,
      kind: options.kind
    });
    
    // Initialize stats
    const stats = {
      totalRelays: options.relays.length,
      connectedRelays: 0,
      failedRelays: 0,
      eventCount: 0
    };
    
    // Update UI with initial stats
    updateRelayStatus(stats);
    updateEventCount(0);
    
    // Map to store events (for deduplication)
    const eventMap = {};
    
    // Fetch from all relays
    const promises = options.relays.map(relay => 
      fetchFromRelay(relay, filter, eventMap, stats)
    );
    
    // Wait for all relays to complete
    await Promise.allSettled(promises);
    
    // Convert the event map to an array
    const events = Object.values(eventMap);
    
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

/**
 * Update the relay status in the UI
 * @param {Object} stats - The relay statistics
 */
function updateRelayStatus(stats) {
  const connectedRelaysElement = document.getElementById('connected-relays');
  if (connectedRelaysElement) {
    connectedRelaysElement.textContent = `Connected relays: ${stats.connectedRelays}/${stats.totalRelays}`;
  }
  
  // Update progress bar
  const progressElement = document.getElementById('fetch-progress');
  if (progressElement) {
    const progress = ((stats.connectedRelays + stats.failedRelays) / stats.totalRelays) * 100;
    progressElement.value = progress;
  }
}

/**
 * Update the event count in the UI
 * @param {number} count - The number of events found
 */
function updateEventCount(count) {
  const eventsFoundElement = document.getElementById('events-found');
  if (eventsFoundElement) {
    eventsFoundElement.textContent = `Events found: ${count}`;
  }
}
