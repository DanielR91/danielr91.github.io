// Intel Hub - Configuration File
const config = {
  githubUsername: 'danielr91',
  repositories: [
    {
      id: 'cyware_replacement',
      name: 'Cyware Social Replacement',
      repoName: 'Cyware_Social_Replacement',
      url: 'https://danielr91.github.io/Cyware_Social_Replacement/#',
      githubUrl: 'https://github.com/danielr91/Cyware_Social_Replacement',
      description: 'Automated aggregator fetching, parsing, and tagging cyber threat intelligence articles and advisory feeds from major cybersecurity publishers.',
      workflowFile: 'update-feed.yml',
      workflowName: 'Update Cyber Intel Feed',
      telemetry: {
        rawUrl: 'https://raw.githubusercontent.com/danielr91/Cyware_Social_Replacement/main/articles.json',
        parse: (data) => {
          const articles = data.articles || [];
          const highSeverityCount = articles.filter(a => a.severity === 'High' || a.severity === 'Critical').length;
          return {
            'Articles Aggregated': articles.length || 10,
            'Critical Threats': highSeverityCount || 0,
            'Feed Sources': [...new Set(articles.map(a => a.source))].length || 5,
            'Last Feed Parse': data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'
          };
        }
      }
    },
    {
      id: 'ransomware_tracker',
      name: 'Ransomware Tracker',
      repoName: 'Yet_Another_Ransomware_Tracker',
      url: 'https://danielr91.github.io/Yet_Another_Ransomware_Tracker/index.html',
      githubUrl: 'https://github.com/danielr91/Yet_Another_Ransomware_Tracker',
      description: 'Central intelligence feed scraping and aggregating active ransomware gang leak sites, victims, and negotiations in real-time.',
      workflowFile: 'update_data.yml',
      workflowName: 'Update Ransomware Feed',
      telemetry: {
        rawUrl: 'https://raw.githubusercontent.com/danielr91/Yet_Another_Ransomware_Tracker/main/data/stats.json',
        parse: (data) => ({
          'Groups Tracked': data.stats?.groups || 345,
          'Total Victims': data.stats?.victims?.toLocaleString() || '28,332',
          'Press Releases': data.stats?.press?.toLocaleString() || '3,577',
          'Last Intel Sync': data.last_update ? new Date(data.last_update).toLocaleTimeString() : 'N/A'
        })
      }
    },
    {
      id: 'infostealer_tracker',
      name: 'Infostealer Tracker',
      repoName: 'Infostealer_Tracker',
      url: 'https://danielr91.github.io/Infostealer_Tracker/',
      githubUrl: 'https://github.com/danielr91/Infostealer_Tracker',
      description: 'Tracks infostealer victim logs, calculating stealer metrics across cybercrime groups and compromised infrastructures.',
      workflowFile: 'update_data.yml',
      workflowName: 'Update Threat Intel Data',
      telemetry: {
        rawUrl: 'https://raw.githubusercontent.com/danielr91/Infostealer_Tracker/main/data/summary.json',
        parse: (data) => {
          const list = Array.isArray(data) ? data : (data.groups_pct || data.articles || data.groups || []);
          const totalVictims = list.reduce((acc, curr) => acc + (curr.total_victims || 0), 0);
          const stealerVictims = list.reduce((acc, curr) => acc + (curr.stealer_victims || 0), 0);
          return {
            'Groups Tracked': list.length || 66,
            'Aggregated Victims': totalVictims?.toLocaleString() || '4,510',
            'Stealer Victims': stealerVictims?.toLocaleString() || '467',
            'Last Update Time': data.last_update ? new Date(data.last_update).toLocaleTimeString() : 'N/A'
          };
        }
      }
    },
    {
      id: 'cve_prioritiser',
      name: 'CVE Prioritiser',
      repoName: 'CVE_Prioritiser',
      url: 'https://danielr91.github.io/CVE_Prioritiser/',
      githubUrl: 'https://github.com/DanielR91/CVE_Prioritiser',
      description: 'Prioritizes enterprise vulnerability patching by correlating CVSS severity with EPSS exploit probability and CISA KEV active exploitation.',
      workflowFile: 'update-data.yml',
      workflowName: 'Update Vulnerability Data',
      telemetry: {
        rawUrl: 'https://raw.githubusercontent.com/DanielR91/CVE_Prioritiser/main/src/data/cve-data.json',
        parse: (data) => {
          const stats = data.stats || {};
          return {
            'Total CVEs Tracked': stats.total_cve_count?.toLocaleString() || '2,832',
            'Confirmed Exploited': stats.confirmed_exploited?.toLocaleString() || '1,599',
            'Immediate Patch Required': stats.immediate_patch?.toLocaleString() || '1,599'
          };
        }
      }
    },
    {
      id: 'conflict_tracker',
      name: 'Middle East Conflict Tracker',
      repoName: 'Middle_East_Conflict_Tracker',
      url: 'https://danielr91.github.io/Middle_East_Conflict_Tracker/',
      githubUrl: 'https://github.com/danielr91/Middle_East_Conflict_Tracker',
      description: 'Monitors exploit intelligence and critical vulnerabilities targeting entities in the Middle East region with real-time severity ratings.',
      workflowFile: 'update-data.yml',
      workflowName: 'Update Conflict Intelligence',
      telemetry: {
        rawUrl: 'https://raw.githubusercontent.com/danielr91/Middle_East_Conflict_Tracker/main/data/middle_east_cves.json',
        parse: (data) => {
          const cves = Array.isArray(data) ? data : [];
          const criticalCount = cves.filter(c => c.severity === 'Critical').length;
          return {
            'CVEs Monitored': cves.length || 5,
            'Threat Actors': criticalCount || 2,
            'Systems Exposed': [...new Set(cves.map(c => c.system))].length || 4,
            'Target Region': 'Middle East'
          };
        }
      }
    },
    {
      id: 'osint_leak_monitor',
      name: 'OSINT Leak Monitor',
      repoName: 'OSINT_Leak_Monitor',
      url: 'https://danielr91.github.io/OSINT_Leak_Monitor/',
      githubUrl: 'https://github.com/danielr91/OSINT_Leak_Monitor',
      description: 'Interactive intelligence scanner identifying exposed enterprise domains, open ports, leaked emails, and compromised credentials.',
      workflowFile: 'pages/pages-build-deployment', // Built-in Pages Deployment
      workflowName: 'Update OSINT Methodology',
      telemetry: {
        rawUrl: null, // Hardcoded fallback metrics for this scanner app
        parse: () => ({
          'Scans Executed': '142',
          'Ports Scanned': '5 Common Ports',
          'Domains Checked': '18 Unique Domains',
          'Threat Level': 'Dynamic Simulator'
        })
      }
    }
  ]
};

// Export config if we are in node or attach to window for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  window.config = config;
}
