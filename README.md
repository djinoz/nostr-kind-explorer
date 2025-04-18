# Nostr Kind Explorer

A web application that allows users to explore and analyze Nostr events by kind for a specific user (npub) within a selected date range.

## Features

- Browse events by kind
- Analyze the distribution of event kinds for a specific user
- Explore the structure and content of different Nostr event kinds
- Filter events by date range
- Connect to multiple relays simultaneously
- Display friendly kind names where known

![Explorer Panel](img/kind-explorer-panel.png)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/djinoz/nostr-kind-explorer.git
   cd nostr-kind-explorer
   ```

2. Install http-server (if not already installed):
   ```
   npm install -g http-server
   ```

3. (Optional) Run the kind name generator to update the kind names:
   ```
   node kind-name-generator.js
   ```
   
   To avoid GitHub API rate limits, you can provide a GitHub personal access token:
   ```
   node kind-name-generator.js --token YOUR_GITHUB_TOKEN
   ```
   
   The script will also attempt to use your git credential manager if available. If no token is provided or found, the script will continue to use the local kind definitions that are already included in the application.
   
   To create a GitHub personal access token:
   1. Go to GitHub Settings > Developer settings > Personal access tokens
   2. Generate a new token with the `public_repo` scope
   3. Use this token with the `--token` option

## Usage

1. Start the server:
   ```
   http-server
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

3. Enter a Nostr public key (npub), select a date range, and click "Fetch Events".

4. Browse events by kind using the dropdown menu.

## How It Works

1. **User Input**: Enter a Nostr public key (npub), select a date range, specify relays, and optionally filter by a specific kind.

2. **Event Fetching**: The application connects to multiple relays simultaneously, converts the npub to hex format if needed, and filters events by author, date range, and optionally kind.

3. **Event Analysis**: Events are grouped by kind, counted, and displayed in a dropdown menu with friendly kind names where known.

4. **Event Exploration**: Events are displayed in reverse chronological order with proper JSON formatting and human-readable timestamps.

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (vanilla JS)
- **Libraries**: 
  - nostr-tools for Nostr protocol interactions
  - bech32 for npub/hex conversion
- **Deployment**: Static HTML file served via http-server

![Results Panel](img/results-highlight-kind.png)

## Kind Name Resolution

The application includes a comprehensive mapping of Nostr event kinds to their friendly names. This mapping is based on the Nostr Implementation Possibilities (NIPs) from the [nostr-protocol/nips](https://github.com/nostr-protocol/nips) repository.

For unknown kinds, the application can look them up dynamically using the GitHub API to search for kind definitions in the NIPs repository.

The included `kind-name-generator.js` script can be run to update the kind names mapping by fetching the latest definitions from the NIPs repository.

## Acknowledgements

Inspired from https://github.com/bordalix/nostr-backup/ and https://undocumented.nostrkinds.info/
Code by Cline and Claude 3.7

## License

This utility is released under the MIT License. See [LICENSE file for details.](https://opensource.org/license/mit)

