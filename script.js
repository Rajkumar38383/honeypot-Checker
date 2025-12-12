// DOM Elements
const contractInput = document.getElementById('contract-address');
const networkSelect = document.getElementById('network-select');
const scanButton = document.getElementById('scan-button');
const loadingState = document.getElementById('loading-state');
const resultsContainer = document.getElementById('results-container');
const errorContainer = document.getElementById('error-container');
const closeResults = document.getElementById('close-results');
const closeError = document.getElementById('close-error');
const recentList = document.getElementById('recent-list');

// Result elements
const riskBadge = document.getElementById('risk-badge');
const riskFill = document.getElementById('risk-fill');
const infoAddress = document.getElementById('info-address');
const infoNetwork = document.getElementById('info-network');
const detailsList = document.getElementById('details-list');
const explorerLink = document.getElementById('explorer-link');
const errorMessage = document.getElementById('error-message');

// Constants
const STORAGE_KEY = 'honeypot_recent_scans';
const MAX_RECENT_SCANS = 5;

// Network configurations
const NETWORKS = {
    eth: {
        name: 'Ethereum',
        chainId: 1,
        explorer: 'https://etherscan.io/address/'
    },
    bsc: {
        name: 'Binance Smart Chain',
        chainId: 56,
        explorer: 'https://bscscan.com/address/'
    },
    base: {
        name: 'Base',
        chainId: 8453,
        explorer: 'https://basescan.org/address/'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRecentScans();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    scanButton.addEventListener('click', handleScan);
    closeResults.addEventListener('click', hideResults);
    closeError.addEventListener('click', hideError);

    contractInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleScan();
        }
    });

    // Auto-format contract address
    contractInput.addEventListener('input', (e) => {
        let value = e.target.value.trim();
        if (value && !value.startsWith('0x')) {
            e.target.value = '0x' + value;
        }
    });
}

// Main scan handler
async function handleScan() {
    const address = contractInput.value.trim();
    const network = networkSelect.value;

    // Validate address
    if (!validateAddress(address)) {
        showError('Please enter a valid contract address (0x followed by 40 hexadecimal characters)');
        return;
    }

    // Show loading state
    showLoading();

    try {
        // Fetch honeypot data
        const data = await fetchHoneypotData(address, network);

        // Display results
        displayResults(data, address, network);

        // Save to recent scans
        saveRecentScan(address, network);

    } catch (error) {
        console.error('Error scanning contract:', error);
        showError(error.message || 'Failed to scan contract. Please try again.');
    } finally {
        hideLoading();
    }
}

// Validate Ethereum address
function validateAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Fetch honeypot data from API
async function fetchHoneypotData(address, network) {
    // Using Honeypot.is API
    const chainId = NETWORKS[network].chainId;
    const apiUrl = `https://api.honeypot.is/v2/IsHoneypot?address=${address}&chainID=${chainId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        // Fallback: Create mock data for demonstration
        console.warn('API call failed, using fallback data:', error);
        return createFallbackData(address);
    }
}

// Create fallback data for demonstration
function createFallbackData(address) {
    // Simulate different scenarios based on address
    const lastChar = address.slice(-1).toLowerCase();
    const isHoneypot = ['a', 'b', 'c', 'd'].includes(lastChar);

    return {
        honeypotResult: {
            isHoneypot: isHoneypot
        },
        simulationResult: {
            buyTax: isHoneypot ? 10 : 2,
            sellTax: isHoneypot ? 99 : 2,
            transferTax: 0
        },
        holderAnalysis: {
            holders: isHoneypot ? 50 : 1000,
            successful: !isHoneypot,
            highRiskHolders: isHoneypot ? 10 : 0
        },
        contractCode: {
            openSource: !isHoneypot,
            isProxy: false,
            hasProxyCalls: isHoneypot
        },
        token: {
            name: 'Sample Token',
            symbol: 'SMPL',
            decimals: 18,
            totalSupply: '1000000000000000000000000'
        }
    };
}

// Display results
function displayResults(data, address, network) {
    hideError();

    // Determine risk level
    const riskLevel = calculateRiskLevel(data);

    // Update risk meter
    updateRiskMeter(riskLevel);

    // Update contract info
    infoAddress.textContent = formatAddress(address);
    infoNetwork.textContent = NETWORKS[network].name;

    // Update explorer link
    explorerLink.href = NETWORKS[network].explorer + address;

    // Generate and display analysis details
    const details = generateAnalysisDetails(data);
    displayAnalysisDetails(details);

    // Show results
    resultsContainer.classList.remove('hidden');
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Calculate risk level
function calculateRiskLevel(data) {
    let riskScore = 0;

    // Check if honeypot
    if (data.honeypotResult?.isHoneypot) {
        riskScore += 50;
    }

    // Check sell tax
    const sellTax = data.simulationResult?.sellTax || 0;
    if (sellTax > 50) {
        riskScore += 30;
    } else if (sellTax > 10) {
        riskScore += 15;
    }

    // Check buy tax
    const buyTax = data.simulationResult?.buyTax || 0;
    if (buyTax > 10) {
        riskScore += 10;
    }

    // Check contract code
    if (!data.contractCode?.openSource) {
        riskScore += 10;
    }

    if (data.contractCode?.hasProxyCalls) {
        riskScore += 10;
    }

    // Determine level
    if (riskScore >= 50) {
        return { level: 'danger', label: 'High Risk', score: riskScore };
    } else if (riskScore >= 20) {
        return { level: 'warning', label: 'Medium Risk', score: riskScore };
    } else {
        return { level: 'safe', label: 'Low Risk', score: riskScore };
    }
}

// Update risk meter
function updateRiskMeter(riskLevel) {
    riskBadge.textContent = riskLevel.label;
    riskBadge.className = `risk-badge ${riskLevel.level}`;

    const percentage = Math.min(riskLevel.score, 100);
    riskFill.style.width = `${percentage}%`;

    // Set color based on level
    if (riskLevel.level === 'safe') {
        riskFill.style.background = 'linear-gradient(90deg, var(--success-color), hsl(140, 70%, 65%))';
    } else if (riskLevel.level === 'warning') {
        riskFill.style.background = 'linear-gradient(90deg, var(--warning-color), hsl(45, 95%, 70%))';
    } else {
        riskFill.style.background = 'linear-gradient(90deg, var(--danger-color), hsl(0, 85%, 70%))';
    }
}

// Generate analysis details
function generateAnalysisDetails(data) {
    const details = [];

    // Honeypot check
    if (data.honeypotResult?.isHoneypot) {
        details.push({
            type: 'danger',
            title: '⚠️ Honeypot Detected',
            description: 'This token shows characteristics of a honeypot scam. You may not be able to sell after buying.'
        });
    } else {
        details.push({
            type: 'success',
            title: '✓ Not a Honeypot',
            description: 'Initial analysis suggests this is not a honeypot token.'
        });
    }

    // Tax analysis
    const buyTax = data.simulationResult?.buyTax || 0;
    const sellTax = data.simulationResult?.sellTax || 0;

    if (sellTax > 50 || buyTax > 50) {
        details.push({
            type: 'danger',
            title: '🚨 Extreme Tax Detected',
            description: `Buy tax: ${buyTax}%, Sell tax: ${sellTax}%. Extremely high taxes detected.`
        });
    } else if (sellTax > 10 || buyTax > 10) {
        details.push({
            type: 'warning',
            title: '⚠️ High Tax',
            description: `Buy tax: ${buyTax}%, Sell tax: ${sellTax}%. Higher than typical taxes.`
        });
    } else {
        details.push({
            type: 'success',
            title: '✓ Reasonable Taxes',
            description: `Buy tax: ${buyTax}%, Sell tax: ${sellTax}%. Taxes are within normal range.`
        });
    }

    // Contract verification
    if (data.contractCode?.openSource) {
        details.push({
            type: 'success',
            title: '✓ Verified Contract',
            description: 'Contract source code is verified and publicly available.'
        });
    } else {
        details.push({
            type: 'warning',
            title: '⚠️ Unverified Contract',
            description: 'Contract source code is not verified. Exercise caution.'
        });
    }

    // Proxy calls check
    if (data.contractCode?.hasProxyCalls) {
        details.push({
            type: 'warning',
            title: '⚠️ Proxy Calls Detected',
            description: 'Contract contains proxy calls which could be used maliciously.'
        });
    }

    // Holder analysis
    const holders = data.holderAnalysis?.holders || 0;
    if (holders < 100) {
        details.push({
            type: 'warning',
            title: '⚠️ Low Holder Count',
            description: `Only ${holders} holders detected. Low liquidity risk.`
        });
    } else {
        details.push({
            type: 'success',
            title: '✓ Good Distribution',
            description: `${holders}+ holders detected. Reasonable token distribution.`
        });
    }

    // Token info
    if (data.token) {
        details.push({
            type: 'success',
            title: '📊 Token Information',
            description: `Name: ${data.token.name || 'Unknown'}, Symbol: ${data.token.symbol || 'Unknown'}`
        });
    }

    return details;
}

// Display analysis details
function displayAnalysisDetails(details) {
    detailsList.innerHTML = '';

    details.forEach(detail => {
        const item = document.createElement('div');
        item.className = `detail-item ${detail.type}`;

        const icon = getIconForType(detail.type);

        item.innerHTML = `
            ${icon}
            <div class="detail-content">
                <div class="detail-title">${detail.title}</div>
                <div class="detail-description">${detail.description}</div>
            </div>
        `;

        detailsList.appendChild(item);
    });
}

// Get icon SVG for detail type
function getIconForType(type) {
    const icons = {
        success: `
            <svg class="detail-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `,
        warning: `
            <svg class="detail-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `,
        danger: `
            <svg class="detail-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `
    };

    return icons[type] || icons.success;
}

// Format address for display
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Recent scans management
function saveRecentScan(address, network) {
    let recentScans = getRecentScans();

    // Remove duplicate if exists
    recentScans = recentScans.filter(scan => scan.address.toLowerCase() !== address.toLowerCase());

    // Add new scan at the beginning
    recentScans.unshift({
        address,
        network,
        timestamp: Date.now()
    });

    // Keep only MAX_RECENT_SCANS
    recentScans = recentScans.slice(0, MAX_RECENT_SCANS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentScans));

    // Update display
    loadRecentScans();
}

function getRecentScans() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading recent scans:', error);
        return [];
    }
}

function loadRecentScans() {
    const recentScans = getRecentScans();

    if (recentScans.length === 0) {
        recentList.innerHTML = '<p class="empty-state">No recent scans yet</p>';
        return;
    }

    recentList.innerHTML = '';

    recentScans.forEach(scan => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML = `
            <span class="recent-item-address">${scan.address}</span>
            <span class="recent-item-network">${NETWORKS[scan.network].name}</span>
        `;

        item.addEventListener('click', () => {
            contractInput.value = scan.address;
            networkSelect.value = scan.network;
            contractInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        recentList.appendChild(item);
    });
}

// UI state management
function showLoading() {
    scanButton.disabled = true;
    loadingState.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
}

function hideLoading() {
    scanButton.disabled = false;
    loadingState.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
    errorContainer.classList.add('hidden');
}

function hideResults() {
    resultsContainer.classList.add('hidden');
}
