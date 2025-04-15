# Nostr Kind Explorer - Specification

## Overview
The Nostr Kind Explorer is a web application that allows users to explore and analyze Nostr events by kind for a specific user (npub) within a selected date range.

## Purpose
To provide a simple, user-friendly tool for Nostr developers and users to:
- Browse events by kind
- Analyze the distribution of event kinds for a specific user
- Explore the structure and content of different Nostr event kinds

## Core Features

### 1. User Input
- **Nostr Public Key (npub)** input field
- **Date Range** selection with start and end date pickers
- **Relay List** input field with default popular relays
- **Specific Kind** input field (optional) allowing direct filtering by a known kind
- **Fetch** button to initiate the event retrieval process

### 2. Event Fetching
- Connect to multiple relays simultaneously
- Convert npub to hex format if needed
- Filter events by:
  - Author (public key)
  - Date range (since/until)
  - Specific kind (if provided)
- Show loading indicator during fetch operations
- Provide error feedback for connection issues or invalid inputs

### 3. Event Analysis & Display
- Group fetched events by kind
- Count events per kind
- Populate dropdown menu with kinds and counts
- Sort kinds numerically
- Display friendly kind names where known (e.g., "Short Text Note" for kind 1)
- Show total event statistics

### 4. Event Exploration
- Display events in reverse chronological order (newest first)
- Format JSON with proper indentation for readability
- Show human-readable timestamps for each event

## Technical Specifications

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (vanilla JS)
- **Libraries**: 
  - nostr-tools for Nostr protocol interactions
  - No framework dependencies required
- **Deployment**: Static HTML file served via http-server

### Performance Considerations
- Implement timeout mechanism for relay connections (10 seconds)
- Handle connection failures gracefully
- De-duplicate events that may be received from multiple relays
- Lazy-load event details to handle potentially large data sets

### User Interface Components
1. **Input Form**
   - Fields for npub, date range, relays, and specific kind
   - Submit button
   - Error message display area

2. **Loading Indicator**
   - Spinner animation
   - Status message

3. **Results Area**
   - Statistics summary (total events, unique kinds)
   - Kind selection dropdown with counts
   - Event display container with scrolling capability

4. **Event Display**
   - Chronological list of events
   - Date/time header for each event
   - Formatted JSON display

## Implementation Details

### Event Filtering
- Allow filtering by specific kind on the input screen
- Support for both specific kind filtering and all-kinds exploration

### Relay Management
- Default to popular relays for user convenience
- Allow customization of relay list
- Handle relay connection failures gracefully

### Data Persistence
- No server-side storage required
- All processing happens client-side

## Deployment

### Installation
```
npm install -g http-server
```

### Running the Application
```
http-server
```

The application will then be available at http://localhost:8080 (or other configured port).

## Future Enhancements (Optional)
- Event content preview for text notes
- Search functionality within events
- Export capability for events
- User profile information display
- Support for NIP-19 entity handling (nprofile, nevent)
- Visualization of event kind distribution
