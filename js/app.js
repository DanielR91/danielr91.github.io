// Intel Hub - Core Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // DOM Elements
  const container = document.getElementById('tracker-cards-container');
  const utcClock = document.getElementById('utc-clock');
  const localClock = document.getElementById('local-clock');
  const globalVictimsTotal = document.getElementById('global-victims-total');
  const terminalBody = document.getElementById('terminal-body');

  // Application State
  const repoDataState = {};
  config.repositories.forEach(repo => {
    repoDataState[repo.id] = {
      metrics: { ...window.fallbackData[repo.id] },
      lastUpdate: null,
      apiStatus: 'OFFLINE'
    };
  });

  // 1. Clock Updates
  function updateClocks() {
    const now = new Date();
    
    // UTC Time
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
    utcClock.textContent = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;

    // Local Time
    const locHours = String(now.getHours()).padStart(2, '0');
    const locMinutes = String(now.getMinutes()).padStart(2, '0');
    const locSeconds = String(now.getSeconds()).padStart(2, '0');
    localClock.textContent = `${locHours}:${locMinutes}:${locSeconds} LOC`;
  }
  setInterval(updateClocks, 1000);
  updateClocks();

  // 2. Relative Time Helper
  function getRelativeTimeString(date) {
    if (!date) return 'UNAVAILABLE';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffHours < 24) return `${diffHours}H AGO`;
    return `${diffDays}D AGO`;
  }

  // 3. Render Dashboard Cards
  function renderCards() {
    if (!container) return;
    container.innerHTML = '';

    config.repositories.forEach(repo => {
      const state = repoDataState[repo.id];
      const card = document.createElement('div');
      card.className = 'glass-panel tracker-card';
      
      // Determine glow state / tag color
      let tagClass = 'tag-cyan';
      let accentClass = 'text-cyan';
      if (repo.id === 'ransomware_tracker') { tagClass = 'tag-red'; accentClass = 'text-red'; }
      if (repo.id === 'cyware_replacement') { tagClass = 'tag-green'; accentClass = 'text-green'; }
      if (repo.id === 'infostealer_tracker') { tagClass = 'tag-amber'; accentClass = 'text-amber'; }
      if (repo.id === 'cve_prioritiser') { tagClass = 'tag-purple'; accentClass = 'text-purple'; }
      if (repo.id === 'conflict_tracker') { tagClass = 'tag-cyan'; accentClass = 'text-cyan'; }
      
      // Construct Workflow status badge URL using Shields.io for custom label injection
      const labelParam = encodeURIComponent(repo.workflowName);
      const badgeUrl = `https://img.shields.io/github/actions/workflow/status/${config.githubUsername}/${repo.repoName}/${repo.workflowFile}?label=${labelParam}`;

      // Header row
      let headerHTML = `
        <div class="card-header-row">
          <div class="card-title-block">
            <div class="card-title-row">
              <h3>${repo.name}</h3>
              <span class="card-tag ${tagClass}">${repo.id.split('_')[0]}</span>
            </div>
            <p class="card-description">${repo.description}</p>
          </div>
          <div class="badge-block">
            <img class="workflow-status-img" src="${badgeUrl}" alt="Workflow Status" onerror="this.src='https://img.shields.ms/badge/GitHub-Actions-brightgreen?logo=github'"/>
            <span class="badge-update-lbl" id="update-lbl-${repo.id}">
              <i data-lucide="clock" class="btn-icon"></i>
              DEPLOY: FETCHING...
            </span>
          </div>
        </div>
      `;

      // Telemetry row
      let telemetryHTML = `<div class="card-telemetry-row">`;
      Object.entries(state.metrics).forEach(([key, val]) => {
        telemetryHTML += `
          <div class="telemetry-item">
            <span class="telemetry-lbl">${key}</span>
            <span class="telemetry-val ${accentClass}">${val}</span>
          </div>
        `;
      });
      telemetryHTML += `</div>`;

      // Actions row
      let actionsHTML = `
        <div class="card-actions-row">
          <a href="${repo.githubUrl}" target="_blank" rel="noopener noreferrer" class="action-btn secondary">
            <i data-lucide="github" class="btn-icon"></i> CODEBASE
          </a>
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="action-btn primary">
            <i data-lucide="external-link" class="btn-icon"></i> LAUNCH APP
          </a>
        </div>
      `;

      card.innerHTML = headerHTML + telemetryHTML + actionsHTML;
      container.appendChild(card);
    });

    // Re-initialize dynamic icons loaded in templates
    lucide.createIcons();
  }

  // 4. Update relative counters on UI
  function updateRelativeCounters() {
    config.repositories.forEach(repo => {
      const state = repoDataState[repo.id];
      const lbl = document.getElementById(`update-lbl-${repo.id}`);
      if (lbl && state.lastUpdate) {
        lbl.innerHTML = `<i data-lucide="clock" class="btn-icon"></i> DEPLOY: ${getRelativeTimeString(state.lastUpdate)}`;
      }
    });
    lucide.createIcons();
  }

  // 5. Fetch Scraper Datasets (No Rate Limit)
  async function fetchTelemetryData() {
    for (const repo of config.repositories) {
      if (!repo.telemetry.rawUrl) continue;
      
      try {
        const response = await fetch(repo.telemetry.rawUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Parse and save metrics
        const parsedMetrics = repo.telemetry.parse(data);
        repoDataState[repo.id].metrics = parsedMetrics;
        
        // Extract inner timestamp if available
        if (data.last_update) {
          repoDataState[repo.id].lastUpdate = new Date(data.last_update);
        } else if (data.lastUpdated) {
          repoDataState[repo.id].lastUpdate = new Date(data.lastUpdated);
        }
        
        addLogEntry('OK', repo.id.toUpperCase(), `Successfully updated datasets from raw storage.`);
      } catch (err) {
        addLogEntry('WARN', repo.id.toUpperCase(), `Raw fetch failed: ${err.message}. Using cache.`);
      }
    }
    
    // Update global counter sum
    updateGlobalTotals();
    renderCards();
    updateRelativeCounters();
    updateChartFromTelemetry();
  }

  // 6. Fetch Git Meta (GitHub API - Rate Limited)
  async function fetchGitHubMeta() {
    for (const repo of config.repositories) {
      try {
        // Fetch last commit from main branch to check deployment times
        const commitUrl = `https://api.github.com/repos/${config.githubUsername}/${repo.repoName}/commits?per_page=1`;
        const res = await fetch(commitUrl);
        
        if (res.status === 403 || res.status === 429) {
          addLogEntry('WARN', 'GITHUB_API', `Rate limit hit. Falling back to local chronometer offsets.`);
          calculateFallbackTimestamps();
          break; // Stop querying API if rate limit hit
        }
        
        if (!res.ok) throw new Error(`HTTP status: ${res.status}`);
        const commits = await res.json();
        
        if (commits && commits.length > 0) {
          const commitDate = new Date(commits[0].commit.committer.date);
          
          // Only override lastUpdate if not set by inner raw file parser (which is more exact to data sync)
          if (!repoDataState[repo.id].lastUpdate) {
            repoDataState[repo.id].lastUpdate = commitDate;
          }
          
          repoDataState[repo.id].apiStatus = 'ONLINE';
          addLogEntry('OK', 'GITHUB_API', `Polled latest repository synchronization commit for ${repo.repoName}.`);
        }
      } catch (err) {
        addLogEntry('WARN', 'GITHUB_API', `Could not fetch details for ${repo.repoName}: ${err.message}`);
        calculateSingleFallbackTimestamp(repo.id);
      }
    }
    renderCards();
    updateRelativeCounters();
  }

  // Calculate realistic offsets if API rate limit hits
  function calculateFallbackTimestamps() {
    const now = new Date();
    // Ransomware - synced roughly 4 hours ago (stats.json showed 06:22:11 UTC)
    repoDataState['ransomware_tracker'].lastUpdate = new Date("2026-05-21T06:22:11.225Z");
    // Cyware - synced 1 hour ago
    repoDataState['cyware_replacement'].lastUpdate = new Date("2026-05-21T09:57:00.086Z");
    // Conflict - synced 2 hours ago
    repoDataState['conflict_tracker'].lastUpdate = new Date(now.getTime() - 2.5 * 60 * 60 * 1000);
    // Infostealer - synced 3 hours ago
    repoDataState['infostealer_tracker'].lastUpdate = new Date("2026-05-21T07:54:26.969Z");
    // CVE Prioritiser - synced 1.5 hours ago
    repoDataState['cve_prioritiser'].lastUpdate = new Date(now.getTime() - 1.5 * 60 * 60 * 1000);
    // OSINT - static deploy 1 day ago
    repoDataState['osint_leak_monitor'].lastUpdate = new Date(now.getTime() - 28 * 60 * 60 * 1000);
  }

  function calculateSingleFallbackTimestamp(id) {
    const now = new Date();
    if (id === 'ransomware_tracker') repoDataState[id].lastUpdate = new Date("2026-05-21T06:22:11.225Z");
    else if (id === 'cyware_replacement') repoDataState[id].lastUpdate = new Date("2026-05-21T09:57:00.086Z");
    else if (id === 'infostealer_tracker') repoDataState[id].lastUpdate = new Date("2026-05-21T07:54:26.969Z");
    else if (id === 'conflict_tracker') repoDataState[id].lastUpdate = new Date(now.getTime() - 3.2 * 60 * 60 * 1000);
    else if (id === 'cve_prioritiser') repoDataState[id].lastUpdate = new Date(now.getTime() - 1.5 * 60 * 60 * 1000);
    else repoDataState[id].lastUpdate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  // Update total dataset summary on header widgets
  function updateGlobalTotals() {
    let ransomwareCount = parseInt(repoDataState['ransomware_tracker'].metrics['Total Victims']?.replace(/,/g, '') || 0);
    let infostealerCount = parseInt(repoDataState['infostealer_tracker'].metrics['Aggregated Victims']?.replace(/,/g, '') || 0);
    let total = ransomwareCount + infostealerCount;
    if (isNaN(total) || total === 0) total = 32842;
    globalVictimsTotal.textContent = total.toLocaleString();
  }

  // Update Chart values dynamically using fetched raw values
  function updateChartFromTelemetry() {
    if (!threatChart) return;
    
    // Ransomware - stats.json has total victims. Scale to match historical monthly trend.
    const liveRansomwareVal = repoDataState['ransomware_tracker'].metrics['Total Victims'] || '28,332';
    const ransomwareNum = parseInt(String(liveRansomwareVal).replace(/,/g, '')) || 28332;
    // Infostealer - summary.json has stealer victims
    const liveInfostealerVal = repoDataState['infostealer_tracker'].metrics['Stealer Victims'] || '467';
    const infostealerNum = parseInt(String(liveInfostealerVal).replace(/,/g, '')) || 467;
    // Articles - articles.json length
    const liveArticlesVal = repoDataState['cyware_replacement'].metrics['Articles Aggregated'] || 124;
    const articlesNum = parseInt(liveArticlesVal) || 124;
    // Conflict - middle_east_cves.json length (multiply by 5 to match visual scale on chart)
    const liveConflictVal = repoDataState['conflict_tracker'].metrics['CVEs Monitored'] || 5;
    const conflictNum = (parseInt(liveConflictVal) || 5) * 5;
    // CISA KEV - cve-data.json has confirmed_exploited
    const liveCisaKevVal = repoDataState['cve_prioritiser'].metrics['Confirmed Exploited'] || '1,599';
    const cisaKevNum = parseInt(String(liveCisaKevVal).replace(/,/g, '')) || 1599;

    // Update the last data point in the chart (index 5 represents current month)
    threatChart.data.datasets[0].data[5] = Math.round(ransomwareNum / 10); // Ransomware (scaled)
    threatChart.data.datasets[1].data[5] = infostealerNum;                 // Infostealer
    threatChart.data.datasets[2].data[5] = articlesNum;                   // Articles Ingested
    threatChart.data.datasets[3].data[5] = conflictNum;                   // Conflict Intel (scaled)
    threatChart.data.datasets[4].data[5] = cisaKevNum;                     // CISA KEV
    
    threatChart.update();
    addLogEntry('INFO', 'CHART_ENGINE', 'Sync timeline graph updated with live telemetry points.');
  }

  // 7. Interactive Chart (Chart.js)
  let threatChart;
  function renderThreatChart() {
    const ctx = document.getElementById('threatTrendChart').getContext('2d');
    
    const gradientCyan = ctx.createLinearGradient(0, 0, 0, 200);
    gradientCyan.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    gradientCyan.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    
    const gradientAmber = ctx.createLinearGradient(0, 0, 0, 200);
    gradientAmber.addColorStop(0, 'rgba(255, 145, 0, 0.4)');
    gradientAmber.addColorStop(1, 'rgba(255, 145, 0, 0.0)');

    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 200);
    gradientGreen.addColorStop(0, 'rgba(0, 230, 118, 0.4)');
    gradientGreen.addColorStop(1, 'rgba(0, 230, 118, 0.0)');

    const gradientRed = ctx.createLinearGradient(0, 0, 0, 200);
    gradientRed.addColorStop(0, 'rgba(255, 23, 68, 0.4)');
    gradientRed.addColorStop(1, 'rgba(255, 23, 68, 0.0)');

    const gradientPurple = ctx.createLinearGradient(0, 0, 0, 200);
    gradientPurple.addColorStop(0, 'rgba(213, 0, 249, 0.4)');
    gradientPurple.addColorStop(1, 'rgba(213, 0, 249, 0.0)');

    threatChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: window.chartData.months,
        datasets: [
          {
            label: 'Ransomware Victims',
            data: window.chartData.ransomwareVictims,
            borderColor: '#00e5ff',
            borderWidth: 2,
            pointBackgroundColor: '#00e5ff',
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradientCyan,
            tension: 0.35
          },
          {
            label: 'Infostealer Victims',
            data: window.chartData.infostealerVictims,
            borderColor: '#ff9100',
            borderWidth: 2,
            pointBackgroundColor: '#ff9100',
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradientAmber,
            tension: 0.35
          },
          {
            label: 'Articles Ingested',
            data: window.chartData.intelArticles,
            borderColor: '#00e676',
            borderWidth: 2,
            pointBackgroundColor: '#00e676',
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradientGreen,
            tension: 0.35
          },
          {
            label: 'Conflict Intel',
            data: window.chartData.criticalCves,
            borderColor: '#ff1744',
            borderWidth: 2,
            pointBackgroundColor: '#ff1744',
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradientRed,
            tension: 0.35
          },
          {
            label: 'CISA KEV',
            data: window.chartData.cisaKev,
            borderColor: '#d500f9',
            borderWidth: 2,
            pointBackgroundColor: '#d500f9',
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradientPurple,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Using custom CSS legend
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0a0f1d',
            titleFont: { family: 'Orbitron', size: 11 },
            bodyFont: { family: 'JetBrains Mono', size: 10 },
            borderColor: 'rgba(0, 229, 255, 0.2)',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.03)'
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Share Tech Mono', size: 10 }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.03)'
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Share Tech Mono', size: 10 }
            }
          }
        }
      }
    });
  }

  // 8. Console Ticker Logs
  let logQueue = [...window.terminalLogs];
  let logPointer = 0;

  function addLogEntry(level, module, message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const now = new Date();
    const timestampStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
    
    let levelClass = 'info';
    if (level === 'OK') levelClass = 'ok';
    if (level === 'WARN') levelClass = 'warn';
    if (level === 'ERROR') levelClass = 'error';

    entry.innerHTML = `
      <span class="log-ts">${timestampStr}</span>
      <span class="log-lbl ${levelClass}">[${level}]</span>
      <span class="log-module">[${module}]</span>
      <span class="log-msg">${message}</span>
    `;

    terminalBody.appendChild(entry);
    
    // Auto-scroll to bottom
    terminalBody.scrollTop = terminalBody.scrollHeight;
    
    // Prune excessive logs to prevent bloat
    while (terminalBody.childElementCount > 40) {
      terminalBody.removeChild(terminalBody.firstChild);
    }
  }

  function simulateLogsTicker() {
    const log = logQueue[logPointer];
    addLogEntry(log.level, log.module, log.message);
    
    logPointer = (logPointer + 1) % logQueue.length;
    
    // Set random delay for next log entry
    const delay = Math.floor(Math.random() * 8000) + 4000;
    setTimeout(simulateLogsTicker, delay);
  }

  // Initialize
  calculateFallbackTimestamps(); // Start with fallback times so UI doesn't look blank
  renderCards();
  renderThreatChart();
  
  // Start log simulator
  setTimeout(simulateLogsTicker, 1000);

  // Core Data Fetch Operations
  fetchTelemetryData();
  fetchGitHubMeta();

  // Polling intervals
  setInterval(fetchTelemetryData, 5 * 60 * 1000); // Poll telemetry every 5 mins
  setInterval(updateRelativeCounters, 30 * 1000); // Update relative labels every 30 secs
});
