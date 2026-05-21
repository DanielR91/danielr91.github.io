// Intel Hub - Fallback & Static Visual Analytics Data
const fallbackData = {
  ransomware_tracker: {
    'Groups Tracked': '345',
    'Total Victims': '28,332',
    'Press Releases': '3,577',
    'Last Intel Sync': '06:22:11 AM'
  },
  cyware_replacement: {
    'Articles Aggregated': '500',
    'Critical Threats': '344',
    'Feed Sources': '9',
    'Last Feed Parse': '09:57:00 AM'
  },
  conflict_tracker: {
    'CVEs Monitored': '5',
    'Threat Actors': '3',
    'Systems Exposed': '4',
    'Target Region': 'Middle East'
  },
  infostealer_tracker: {
    'Groups Tracked': '142',
    'Aggregated Victims': '11,872',
    'Stealer Victims': '2,462',
    'Last Update Time': '07:54:26 AM'
  },
  osint_leak_monitor: {
    'Scans Executed': '142',
    'Ports Scanned': '5 Common Ports',
    'Domains Checked': '18 Unique Domains',
    'Threat Level': 'Dynamic Simulator'
  }
};

// Historical timeline charts data
const chartData = {
  months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
  ransomwareVictims: [2410, 2890, 3105, 3450, 3120, 2833],
  infostealerVictims: [1210, 1430, 1720, 1950, 2180, 2462],
  criticalCves: [12, 19, 15, 22, 18, 25],
  intelArticles: [230, 280, 340, 390, 440, 500]
};

// Simulated security operations logs for the live ticker
const terminalLogs = [
  { level: 'INFO', module: 'SCHEDULER', message: 'Initializing automated CTI scraper daemon v2.4.1...' },
  { level: 'INFO', module: 'RANSOMWARE', message: 'Connecting to TOR gateway proxy node...' },
  { level: 'OK',   module: 'RANSOMWARE', message: 'Scraping lockbit3 onion portal. Found 4 new victims.' },
  { level: 'OK',   module: 'RANSOMWARE', message: 'Scraping play_leak onion portal. Found 1 new victim.' },
  { level: 'INFO', module: 'CYWARE',     message: 'Parsing RSS news feeds from CISA, BleepingComputer, Hacker News...' },
  { level: 'OK',   module: 'CYWARE',     message: 'Synchronized 14 new advisories. Severity tagging complete.' },
  { level: 'INFO', module: 'CVE_RADAR',  message: 'Scanning GitHub repositories for active CVE-2026 PoC exploits...' },
  { level: 'WARN', module: 'CVE_RADAR',  message: 'Detected active in-the-wild exploitation for CVE-2024-21412.' },
  { level: 'OK',   module: 'INFOSTEALER',message: 'Updated database index. Stealer victim log counts synced (Total: 4,510).' },
  { level: 'INFO', module: 'OSINT_SCAN', message: 'Domain watch initialized. Tracking 18 key target assets.' },
  { level: 'OK',   module: 'SYSTEM',     message: 'Intel Hub metrics database update broadcast: Success.' },
  { level: 'INFO', module: 'INTEGRITY',  message: 'Verifying GitHub Action runner status... All badges PASSING.' }
];

// Export to Node or Window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fallbackData, chartData, terminalLogs };
} else {
  window.fallbackData = fallbackData;
  window.chartData = chartData;
  window.terminalLogs = terminalLogs;
}
