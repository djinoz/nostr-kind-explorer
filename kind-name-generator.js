#!/usr/bin/env node

/**
 * Kind Name Generator
 * This script fetches kind names from the Nostr NIPs repository
 * and generates a JSON file with the mapping of kind numbers to names.
 * 
 * Usage:
 *   node kind-name-generator.js [--token <github_token>]
 * 
 * Options:
 *   --token <github_token>  GitHub personal access token for API authentication
 *                          (helps avoid rate limits)
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// Base kinds we know
const kindNames = {
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

// Parse command line arguments
const args = process.argv.slice(2);
let githubToken = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--token' && i + 1 < args.length) {
    githubToken = args[i + 1];
    i++; // Skip the next argument
  }
}

// Try to get token from git credential manager if not provided
if (!githubToken) {
  try {
    console.log('No GitHub token provided. Attempting to use git credential manager...');
    const gitCredential = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8'
    });
    
    const match = gitCredential.match(/password=([^\n]+)/);
    if (match && match[1]) {
      githubToken = match[1];
      console.log('Successfully retrieved token from git credential manager.');
    }
  } catch (error) {
    console.log('Could not retrieve GitHub token from git credential manager.');
  }
}

/**
 * Make a GitHub API request
 * @param {string} url - The URL to request
 * @returns {Promise<Object>} A promise that resolves to the response data
 */
function githubRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Nostr-Kind-Explorer',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    // Add authorization header if token is available
    if (githubToken) {
      options.headers['Authorization'] = `token ${githubToken}`;
    }
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Error parsing JSON: ${error.message}`));
          }
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          console.error(`GitHub API rate limit exceeded (${res.statusCode}). Using local kind definitions only.`);
          // Instead of rejecting, resolve with an empty result
          resolve({ items: [] });
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.error(`Network error: ${err.message}. Using local kind definitions only.`);
      // Instead of rejecting, resolve with an empty result
      resolve({ items: [] });
    });
  });
}

/**
 * Fetch the content of a file from GitHub
 * @param {string} url - The URL of the file
 * @returns {Promise<string>} A promise that resolves to the file content
 */
async function fetchFileContent(url) {
  try {
    const fileData = await githubRequest(url);
    return Buffer.from(fileData.content, 'base64').toString('utf-8');
  } catch (error) {
    console.error(`Error fetching file content: ${error.message}`);
    return '';
  }
}

/**
 * Extract kind definitions from content
 * @param {string} content - The content to extract kind definitions from
 * @returns {Object} An object with kind numbers as keys and names as values
 */
function extractKindDefinitions(content) {
  const extractedKinds = {};
  
  // Look for kind definitions in various formats
  
  // Format: kind: X, <description>
  const kindRegex1 = /kind:\s*(\d+)[^,]*,\s*([^,\n\r]+)/gi;
  let match1;
  
  while ((match1 = kindRegex1.exec(content)) !== null) {
    const kind = parseInt(match1[1], 10);
    const name = match1[2].trim();
    
    if (!extractedKinds[kind]) {
      extractedKinds[kind] = name;
    }
  }
  
  // Format: "kind" X (<description>)
  const kindRegex2 = /"kind"\s*(\d+)\s*\(([^)]+)\)/gi;
  let match2;
  
  while ((match2 = kindRegex2.exec(content)) !== null) {
    const kind = parseInt(match2[1], 10);
    const name = match2[2].trim();
    
    if (!extractedKinds[kind]) {
      extractedKinds[kind] = name;
    }
  }
  
  // Format: Kind X: <description>
  const kindRegex3 = /kind\s*(\d+):\s*([^,\n\r]+)/gi;
  let match3;
  
  while ((match3 = kindRegex3.exec(content)) !== null) {
    const kind = parseInt(match3[1], 10);
    const name = match3[2].trim();
    
    if (!extractedKinds[kind]) {
      extractedKinds[kind] = name;
    }
  }
  
  return extractedKinds;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Fetching kind names from Nostr NIPs repository...');
    
    // Search for kind definitions in NIPs
    const searchUrl = 'https://api.github.com/search/code?q=repo:nostr-protocol/nips+kind&per_page=100';
    const searchData = await githubRequest(searchUrl);
    
    // If we have items, process them
    if (searchData.items && searchData.items.length > 0) {
      console.log(`Found ${searchData.items.length} files with kind definitions`);
    } else {
      console.log('No files found or GitHub API rate limit exceeded. Using local kind definitions only.');
    }
    
    // Process each result
    for (const item of searchData.items) {
      console.log(`Processing ${item.path}...`);
      
      // Fetch the file content
      const content = await fetchFileContent(item.url);
      
      // Extract kind definitions
      const extractedKinds = extractKindDefinitions(content);
      
      // Add to our map if not already present
      for (const [kind, name] of Object.entries(extractedKinds)) {
        if (!kindNames[kind]) {
          kindNames[kind] = name;
          console.log(`Found kind ${kind}: ${name}`);
        }
      }
    }
    
    // Write to JSON file
    const outputPath = 'js/kind-names.json';
    fs.writeFileSync(outputPath, JSON.stringify(kindNames, null, 2));
    console.log(`Kind names written to ${outputPath}`);
    
    // Also update the KIND_NAMES object in kind-names.js
    const kindNamesJsPath = 'js/kind-names.js';
    
    try {
      const kindNamesJs = fs.readFileSync(kindNamesJsPath, 'utf-8');
      
      // Replace the KIND_NAMES object
      const updatedKindNamesJs = kindNamesJs.replace(
        /const KIND_NAMES = \{[^}]*\};/s,
        `const KIND_NAMES = ${JSON.stringify(kindNames, null, 2)};`
      );
      
      fs.writeFileSync(kindNamesJsPath, updatedKindNamesJs);
      console.log(`Updated KIND_NAMES object in ${kindNamesJsPath}`);
    } catch (error) {
      console.error(`Error updating kind-names.js: ${error.message}`);
      console.log('The JSON file was updated successfully, but the JS file could not be updated.');
    }
    
    console.log('Kind name generation completed successfully!');
    console.log(`Total kinds defined: ${Object.keys(kindNames).length}`);
    
  } catch (error) {
    console.error('Error fetching kind names:', error);
  }
}

// Run the main function
main();
