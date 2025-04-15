/**
 * Default list of popular Nostr relays
 * This list can be customized by the user in the application
 */
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://nostr.wine',
  'wss://relay.current.fyi',
  'wss://relay.snort.social',
  'wss://nostr.fmt.wiz.biz',
  'wss://relay.nostr.info',
  'wss://nostr.zebedee.cloud',
  'wss://nostr.oxtr.dev',
  'wss://brb.io',
  'wss://relay.nostr.bg',
  'wss://nostr.mom',
];

/**
 * Parse relay list from string input
 * @param {string} relaysString - Comma-separated list of relay URLs
 * @returns {string[]} Array of relay URLs
 */
function parseRelayList(relaysString) {
  if (!relaysString || relaysString.trim() === '') {
    return DEFAULT_RELAYS;
  }
  
  return relaysString
    .split(',')
    .map(relay => relay.trim())
    .filter(relay => relay.startsWith('wss://') || relay.startsWith('ws://'));
}
