/**
 * Mapping of Nostr event kinds to their friendly names
 * Based on NIPs (Nostr Implementation Possibilities)
 * https://github.com/nostr-protocol/nips
 */
const KIND_NAMES = {
  "0": "Metadata",
  "1": "Short Text Note",
  "2": "Recommend Relay",
  "3": "Contacts",
  "4": "Encrypted Direct Message",
  "5": "Event Deletion",
  "6": "Repost",
  "7": "Reaction",
  "8": "Badge Award",
  "9": "Cancel Badge Award",
  "10": "Job Request",
  "11": "Job Result",
  "12": "[51](51.md) | list entries should be chronological |",
  "13": "\"pubkey\": \"<real author's pubkey>\"",
  "14": "\"pubkey\": randomPublicKey",
  "21": "`\"a\"` (software application event) |",
  "40": "Channel Creation",
  "41": "Channel Metadata",
  "42": "Channel Message",
  "43": "Channel Hide Message",
  "44": "Channel Mute User",
  "45": "Public Chat Reserved",
  "64": "which can be read by humans and is also supported by most chess software.",
  "818": "i.e. if one thinks `Shell structure` should redirect to `Thin-shell structure` they can issue one of these events instead of replicating the content. These events can be used for automatically redirecting between articles on a client",
  "1018": "followed by one or more response tags.",
  "1040": "<event-id>",
  "1059": "content: nip44Encrypt(event",
  "1063": "File Metadata",
  "1068": "followed by an option label field.",
  "1111": "Markdown",
  "1311": "\"tags\": [",
  "1337": "\"python\"",
  "1621": "// Open",
  "1984": "Reporting",
  "1985": "including distributed moderation",
  "5000": "published by a customer. This event signals that a customer is interested in receiving the result of some kind of compute.",
  "5001": "where users request jobs to be processed in certain ways (e.g.",
  "6000": "providing the output of the job result. They should tag the original job request event id as well as the customer's pubkey.",
  "7000": "this can be interpreted as a suggestion to pay. Service Providers MUST use the `payment-required` feedback event to signal that a payment is required and no further actions will be performed until the payment is sent.",
  "7375": "and multiple proofs inside each `kind:7375` event.",
  "7376": "\"content\": nip44_encrypt([",
  "9000": "in which case the user is assumed to be a member.",
  "9009": "\"content\": \"optional reason\"",
  "9021": "if the request is pending review",
  "9041": "\"tags\": [",
  "9321": "p-tagging the recipient. The outputs are P2PK-locked to the public key the recipient indicated in their `kind:10019` event.",
  "9734": "Zap Request",
  "9735": "Zap",
  "9802": "a \"highlight\" event",
  "10000": "Mute List",
  "10001": "Pin List",
  "10002": "Relay List Metadata",
  "10019": "if no event is found",
  "10050": "making it for a very simple and lightweight implementation that should be fast.",
  "13194": "Wallet Info",
  "17375": "\"content\": nip44_encrypt([",
  "22242": "Client Authentication",
  "23194": "Wallet Request",
  "23195": "Wallet Response",
  "24133": "Nostr Connect",
  "30000": "Categorized People List",
  "30001": "Categorized Bookmark List",
  "30008": "Profile Badges",
  "30009": "Badge Definition",
  "30015": "users are expected to have more than one set of each kind",
  "30017": "Create or update a stall",
  "30018": "Create or update a product",
  "30023": "Long-form Content",
  "30078": "Application-specific Data",
  "30311": "`Speaker`",
  "30315": "where the `d` tag represents the status type:",
  "30402": "Classifieds",
  "30403": "whether included in the markdown content or not",
  "30818": "and it's expected that multiple people will write articles about the exact same subjects",
  "31337": "a `kind:31337`-centric client (tracks). Using Zapstr",
  "31922": "if it exists.",
  "31989": "Handler recommendation",
  "31990": "Handler information",
  "34550": "`\"r\"` for each relay in use |",
  "39000": "who is an admin and with which permission or not",
  "39001": "group state or metadata events.",
  "39002": "to restrict what pubkeys can fetch it or to only display a subset of the members in it.",
  "39003": "it's a relay policy that can vary. Roles can be assigned by other users (as long as they have the capability to add roles) by publishing a `kind:9000` event with that user's pubkey in a `p` tag and the roles afterwards (even if the user is already a group member a `kind:9000` can be issued and the user roles must just be updated)."
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
