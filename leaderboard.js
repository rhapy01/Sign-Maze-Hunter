// Enhanced Leaderboard functionality with anonymous user system
let leaderboardData = [];
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let currentUser = null; // Store current user info

// Function to get browser fingerprint for device identification
function getBrowserFingerprint() {
    return {
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language || navigator.userLanguage,
        platform: navigator.platform,
        userAgent: navigator.userAgent
    };
}

// Function to get or create device ID
function getDeviceId() {
    let deviceId = localStorage.getItem('sign_vanguard_device_id');
    if (!deviceId) {
        // Generate a temporary ID that will be replaced by server
        deviceId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sign_vanguard_device_id', deviceId);
    }
    return deviceId;
}

// Function to set device ID (when received from server)
function setDeviceId(deviceId) {
    localStorage.setItem('sign_vanguard_device_id', deviceId);
}

// Function to identify or register user
async function identifyUser(playerName) {
    try {
        const fingerprint = getBrowserFingerprint();
        const existingDeviceId = getDeviceId();

        console.log('Identifying user with name:', playerName);

        const response = await fetch('/api/user/identify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerName: playerName.trim(),
                fingerprint: fingerprint,
                existingDeviceId: existingDeviceId.startsWith('temp_') ? null : existingDeviceId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to identify user');
        }

        const userData = await response.json();
        
        // Update stored device ID
        setDeviceId(userData.deviceId);
        currentUser = userData;

        console.log('User identified:', userData);

        // Show verification status
        if (userData.isExisting && !userData.isVerified) {
            showUserMessage(`Welcome back, ${userData.playerName}! You can verify your account for enhanced security.`, 'info');
        } else if (!userData.isExisting) {
            showUserMessage(`New player registered: ${userData.playerName}!`, 'success');
        } else if (userData.isVerified) {
            showUserMessage(`Welcome back, ${userData.playerName}! ✓ Verified`, 'success');
        }

        return userData;

    } catch (error) {
        console.error('Error identifying user:', error);
        showUserMessage(`Failed to register/identify user: ${error.message}`, 'error');
        throw error;
    }
}

// Function to verify current user
async function verifyUser() {
    if (!currentUser) {
        showUserMessage('No user to verify', 'error');
        return false;
    }

    try {
        const response = await fetch('/api/user/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId: currentUser.deviceId,
                challenge: 'verification_request'
            })
        });

        const result = await response.json();

        if (response.ok && result.verified) {
            currentUser.isVerified = true;
            showUserMessage('User verified successfully! ✓', 'success');
            return true;
        } else {
            showUserMessage(result.message || 'Verification failed', 'error');
            return false;
        }

    } catch (error) {
        console.error('Error verifying user:', error);
        showUserMessage('Verification failed', 'error');
        return false;
    }
}

// Function to show user messages
function showUserMessage(message, type = 'info') {
    // Create or update message container
    let messageContainer = document.getElementById('userMessage');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'userMessage';
        messageContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(messageContainer);
    }

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };

    messageContainer.style.backgroundColor = colors[type] || colors.info;
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }, 5000);
}

// Function to format date
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to format time duration
function formatTime(seconds) {
    if (!seconds || seconds === 0) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Function to get rank color based on position
function getRankColor(rank) {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
}

// Function to update the leaderboard table with verification status
function updateLeaderboardTable(scores, pagination) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    if (!scores || scores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No scores found</td></tr>';
        return;
    }

    scores.forEach((entry, index) => {
        const globalRank = (pagination.current - 1) * 10 + index + 1;
        const row = document.createElement('tr');
        const rankClass = getRankColor(globalRank);
        
        // Add verification indicator
        const verificationIcon = (entry.isVerified || entry.isUserVerified) ? ' ✓' : ' ?';
        const verificationClass = (entry.isVerified || entry.isUserVerified) ? 'verified' : 'unverified';
        
        row.innerHTML = `
            <td class="rank ${rankClass}">#${globalRank}</td>
            <td class="player-name ${verificationClass}">
                ${escapeHtml(entry.signId || entry.playerName)}${verificationIcon}
            </td>
            <td class="score">${entry.score.toLocaleString()}</td>
            <td class="level">Level ${entry.level}</td>
            <td class="stats">${entry.enemiesDefeated || 0}</td>
            <td class="stats">${entry.treasuresFound || 0}</td>
            <td class="date">${formatDate(entry.createdAt || entry.date)}</td>
            <td class="actions">
                <button onclick="viewPlayerStats('${entry.signId || entry.playerName}')" class="stats-btn">Stats</button>
            </td>
        `;
        
        // Add hover effect for additional stats
        let tooltip = `Player ID: ${entry.signId || entry.playerName}\nSubmitted: ${formatDate(entry.createdAt || entry.date)}`;
        if (entry.gameTime) {
            tooltip += `\nGame Time: ${formatTime(entry.gameTime)}`;
        }
        if (entry.isVerified || entry.isUserVerified) {
            tooltip += '\n✓ Verified User';
        } else {
            tooltip += '\n? Unverified User';
        }
        row.title = tooltip;
        
        tbody.appendChild(row);
    });

    // Update pagination info
    updatePaginationInfo(pagination);
}

// Function to view player stats (placeholder - needs device ID)
async function viewPlayerStats(playerName) {
    showUserMessage(`Player stats feature coming soon! Currently viewing: ${playerName}`, 'info');
    // TODO: This would need the device ID to properly fetch stats
    // For now, we'll just show a placeholder
}

// Function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to update pagination controls
function updatePaginationInfo(pagination) {
    const paginationInfo = document.getElementById('paginationInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${pagination.current} of ${pagination.total} (${pagination.totalScores} total scores)`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = pagination.current <= 1;
        prevBtn.onclick = () => pagination.current > 1 && fetchLeaderboardData(pagination.current - 1);
    }
    
    if (nextBtn) {
        nextBtn.disabled = pagination.current >= pagination.total;
        nextBtn.onclick = () => pagination.current < pagination.total && fetchLeaderboardData(pagination.current + 1);
    }
    
    currentPage = pagination.current;
    totalPages = pagination.total;
}

// Function to fetch leaderboard data from the backend with pagination
async function fetchLeaderboardData(page = 1, limit = 10) {
    if (isLoading) return;
    
    isLoading = true;
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loading) loading.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';

    try {
        const response = await fetch(`/api/leaderboard?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.scores) {
            leaderboardData = data.scores;
            updateLeaderboardTable(data.scores, data.pagination);
        } else {
            // Handle legacy response format (array of scores)
        leaderboardData = data;
            updateLeaderboardTable(data, { current: 1, total: 1, totalScores: data.length });
        }
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        
        if (errorMessage) {
            errorMessage.textContent = `Failed to load leaderboard: ${error.message}`;
            errorMessage.style.display = 'block';
        } else {
            showUserMessage(`Failed to load leaderboard data: ${error.message}`, 'error');
        }
    } finally {
        if (loading) loading.style.display = 'none';
        isLoading = false;
    }
}

// Enhanced function to submit a new score with user verification
async function submitScore(playerName, score, level, gameStats = {}) {
    try {
        // First identify/register user
        const user = await identifyUser(playerName);
        
        const scoreData = {
            deviceId: user.deviceId,
            playerName: playerName.trim(),
            score: parseInt(score),
            level: parseInt(level),
            gameTime: gameStats.gameTime || 0,
            enemiesDefeated: gameStats.enemiesDefeated || 0,
            treasuresFound: gameStats.treasuresFound || 0
        };

        console.log('Submitting score:', scoreData);

        const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scoreData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 403 && responseData.error.includes('verification')) {
                const shouldVerify = confirm(
                    'High scores require verification for security. Would you like to verify your account now?'
                );
                if (shouldVerify) {
                    const verified = await verifyUser();
                    if (verified) {
                        // Retry submission after verification
                        return await submitScore(playerName, score, level, gameStats);
                    }
                }
            }
            throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('Score submitted successfully:', responseData);
        
        // Show success message
        const verificationStatus = responseData.isVerified ? '✓ Verified' : '? Unverified';
        showUserMessage(
            `Score submitted successfully! ${verificationStatus}`, 
            responseData.isVerified ? 'success' : 'info'
        );

        // Refresh the leaderboard after submitting
        await fetchLeaderboardData(1);
        
        return responseData;
        
    } catch (error) {
        console.error('Error submitting score:', error);
        
        if (error.message.includes('Duplicate submission')) {
            showUserMessage('Score already submitted recently. Please wait before submitting again.', 'warning');
        } else if (error.message.includes('Validation')) {
            showUserMessage(`Invalid data: ${error.message}`, 'error');
        } else if (error.message.includes('User not found')) {
            showUserMessage('Please try again - user registration failed', 'error');
        } else {
            showUserMessage(`Failed to submit score: ${error.message}`, 'error');
        }
        
        throw error;
    }
}

// Function to fetch player statistics by device ID
async function fetchPlayerStats(deviceId) {
    try {
        const response = await fetch(`/api/player/${encodeURIComponent(deviceId)}/stats`);
        
        if (response.status === 404) {
            return null; // Player not found
        }
        
        if (!response.ok) {
            throw new Error(`Failed to fetch player stats: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching player stats:', error);
        return null;
    }
}

// Function to display current user stats
async function displayCurrentUserStats() {
    if (!currentUser) {
        showUserMessage('No user logged in', 'error');
        return;
    }

    const stats = await fetchPlayerStats(currentUser.deviceId);
    if (stats) {
        displayPlayerStats(stats);
    } else {
        showUserMessage('No statistics found', 'info');
    }
}

// Function to display player stats in a modal or section
function displayPlayerStats(stats) {
    if (!stats) {
        showUserMessage('No statistics found for this player.', 'info');
        return;
    }
    
    const statsHtml = `
        <div class="player-stats">
            <h3>Player Statistics: ${stats.playerName} ${stats.isVerified ? '✓' : '?'}</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Games:</span>
                    <span class="stat-value">${stats.totalGames || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Best Score:</span>
                    <span class="stat-value">${stats.bestScore?.toLocaleString() || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Average Score:</span>
                    <span class="stat-value">${Math.round(stats.averageScore || 0).toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Highest Level:</span>
                    <span class="stat-value">${stats.highestLevel || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Enemies Defeated:</span>
                    <span class="stat-value">${stats.totalEnemiesDefeated || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Treasures Found:</span>
                    <span class="stat-value">${stats.totalTreasuresFound || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Game Time:</span>
                    <span class="stat-value">${formatTime(stats.totalGameTime || 0)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Account Created:</span>
                    <span class="stat-value">${formatDate(stats.accountCreated)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Last Active:</span>
                    <span class="stat-value">${formatDate(stats.lastActive)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Verification Status:</span>
                    <span class="stat-value ${stats.isVerified ? 'verified' : 'unverified'}">
                        ${stats.isVerified ? '✓ Verified' : '? Unverified'}
                    </span>
                </div>
            </div>
            ${!stats.isVerified ? '<button onclick="verifyUser()" class="verify-btn">Verify Account</button>' : ''}
        </div>
    `;
    
    // You can customize this to show in a modal, sidebar, or replace content
    const statsContainer = document.getElementById('playerStatsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = statsHtml;
        statsContainer.style.display = 'block';
    } else {
        // Fallback: show in alert (not ideal but functional)
        showUserMessage(`Player Stats for ${stats.playerName}: Games: ${stats.totalGames}, Best: ${stats.bestScore?.toLocaleString()}`, 'info');
    }
}

// Function to refresh the leaderboard
function refreshLeaderboard() {
    fetchLeaderboardData(currentPage);
}

// Function to check server health
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health');
        const health = await response.json();
        console.log('Server health:', health);
        return health;
    } catch (error) {
        console.error('Server health check failed:', error);
        return null;
    }
}

// Function to initialize user on page load
async function initializeUser() {
    const deviceId = getDeviceId();
    if (deviceId && !deviceId.startsWith('temp_')) {
        console.log('Found existing device ID:', deviceId);
        // TODO: Could fetch user info or validate device ID here
    }
}

// Enhanced initialization with error handling and user setup
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Leaderboard page initialized');
    
    // Initialize user system
    await initializeUser();
    
    // Check server health first
    const health = await checkServerHealth();
    if (!health) {
        console.warn('Server health check failed');
        showUserMessage('Server connection issues detected', 'warning');
    }
    
    // Load initial leaderboard data
    await fetchLeaderboardData(1);
    
    // Set up refresh button if it exists
    const refreshBtn = document.getElementById('refreshLeaderboard');
    if (refreshBtn) {
        refreshBtn.onclick = refreshLeaderboard;
    }

    // Set up user stats button if it exists
    const userStatsBtn = document.getElementById('userStatsBtn');
    if (userStatsBtn) {
        userStatsBtn.onclick = displayCurrentUserStats;
    }

    // Set up verification button if it exists
    const verifyBtn = document.getElementById('verifyBtn');
    if (verifyBtn) {
        verifyBtn.onclick = verifyUser;
    }
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            refreshLeaderboard();
        }
        if (e.key === 'v' && e.ctrlKey && e.altKey) {
            e.preventDefault();
            verifyUser();
        }
    });
});

// Export functions for use in other modules
window.leaderboardAPI = {
    fetchLeaderboardData,
    submitScore,
    fetchPlayerStats,
    displayPlayerStats,
    refreshLeaderboard,
    checkServerHealth,
    identifyUser,
    verifyUser,
    getCurrentUser: () => currentUser
}; 