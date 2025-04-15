/**
 * Mapping of Nostr event kinds to their friendly names
 * Based on NIPs (Nostr Implementation Possibilities)
 * https://github.com/nostr-protocol/nips
 */
const KIND_NAMES = {
  0: "Metadata",
  1: "Short Text Note",
  2: "Recommend Relay",
  3: "Contacts",
  4: "Encrypted Direct Message",
  5: "Event Deletion",
  6: "Repost",
  7: "Reaction",
  8: "Badge Award",
  9: "Cancel Badge Award",
  10: "Job Request",
  11: "Job Result",
  40: "Channel Creation",
  41: "Channel Metadata",
  42: "Channel Message",
  43: "Channel Hide Message",
  44: "Channel Mute User",
  45: "Public Chat Reserved",
  1063: "File Metadata",
  1984: "Reporting",
  9734: "Zap Request",
  9735: "Zap",
  10000: "Mute List",
  10001: "Pin List",
  10002: "Relay List Metadata",
  13194: "Wallet Info",
  22242: "Client Authentication",
  23194: "Wallet Request",
  23195: "Wallet Response",
  24133: "Nostr Connect",
  30000: "Categorized People List",
  30001: "Categorized Bookmark List",
  30008: "Profile Badges",
  30009: "Badge Definition",
  30017: "Create or update a stall",
  30018: "Create or update a product",
  30023: "Long-form Content",
  30078: "Application-specific Data",
  30402: "Classifieds",
  31989: "Handler recommendation",
  31990: "Handler information",
};

/**
 * Get the friendly name for a kind
 * @param {number} kind - The kind number
 * @returns {string} The friendly name or "Kind X" if not found
 */
function getKindName(kind) {
  return KIND_NAMES[kind] || `Kind ${kind}`;
}

/**
 * Lookup an unknown kind name from the Nostr NIPs repository
 * This is an asynchronous function that will query the GitHub API
 * @param {number} kind - The kind number to look up
 * @returns {Promise<string>} A promise that resolves to the kind name
 */
async function lookupUnknownKind(kind) {
  if (KIND_NAMES[kind]) {
    return KIND_NAMES[kind];
  }
  
  try {
    const response = await fetch(
      `https://api.github.com/search/code?q=repo:nostr-protocol/nips+/kind.*\\b${kind}\\b/`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Process the first result
      const item = data.items[0];
      
      // Fetch the file content to extract the kind name
      const fileResponse = await fetch(item.url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error(`GitHub API error: ${fileResponse.status}`);
      }
      
      const fileData = await fileResponse.json();
      
      // Look for a pattern like "kind: X, <description>"
      const content = atob(fileData.content);
      const kindRegex = new RegExp(`kind:\\s*${kind}[^,]*,\\s*([^\\n\\r]+)`, 'i');
      const match = content.match(kindRegex);
      
      if (match && match[1]) {
        const kindName = match[1].trim();
        // Cache the result
        KIND_NAMES[kind] = kindName;
        return kindName;
      }
    }
    
    // If no match found, return the default
    return `Kind ${kind}`;
  } catch (error) {
    console.error(`Error looking up kind ${kind}:`, error);
    return `Kind ${kind}`;
  }
}

/**
 * Generate a kind name generator script
 * This is a utility function that can be used to generate a script
 * that will fetch kind names from the Nostr NIPs repository
 * @returns {string} A script that can be used to generate kind names
 */
function generateKindNameScript() {
  return `
// This script fetches kind names from the Nostr NIPs repository
// Run it with Node.js to generate a kind-names.json file

const fs = require('fs');
const https = require('https');

// Base kinds we know
const kindNames = ${JSON.stringify(KIND_NAMES, null, 2)};

// Function to make a GitHub API request
function githubRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Nostr-Kind-Explorer',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(\`GitHub API error: \${res.statusCode}\`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Main function
async function fetchKindNames() {
  try {
    // Search for kind definitions in NIPs
    const searchUrl = 'https://api.github.com/search/code?q=repo:nostr-protocol/nips+kind';
    const searchData = await githubRequest(searchUrl);
    
    // Process each result
    for (const item of searchData.items) {
      // Fetch the file content
      const fileUrl = item.url;
      const fileData = await githubRequest(fileUrl);
      
      // Decode the content
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      
      // Look for kind definitions
      const kindRegex = /kind:\\s*(\\d+)[^,]*,\\s*([^\\n\\r]+)/gi;
      let match;
      
      while ((match = kindRegex.exec(content)) !== null) {
        const kind = parseInt(match[1], 10);
        const name = match[2].trim();
        
        // Add to our map if not already present
        if (!kindNames[kind]) {
          kindNames[kind] = name;
          console.log(\`Found kind \${kind}: \${name}\`);
        }
      }
    }
    
    // Write to JSON file
    fs.writeFileSync('kind-names.json', JSON.stringify(kindNames, null, 2));
    console.log('Kind names written to kind-names.json');
    
  } catch (error) {
    console.error('Error fetching kind names:', error);
  }
}

fetchKindNames();
  `;
}
