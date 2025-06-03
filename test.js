const fetch = require('node-fetch');

async function testLeaderboard() {
    try {
        console.log('Registering user...');
        // First register a user
        const userResponse = await fetch('http://localhost:3000/api/user/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fingerprint: {
                    userAgent: 'test',
                    screenResolution: '1920x1080',
                    timezone: 'UTC',
                    language: 'en',
                    platform: 'win32'
                }
            })
        });

        if (!userResponse.ok) {
            const error = await userResponse.text();
            throw new Error(`Failed to register user: ${error}`);
        }

        const userData = await userResponse.json();
        console.log('User registration response:', userData);

        if (userData.deviceId) {
            console.log('Submitting score...');
            // Submit a score
            const scoreResponse = await fetch('http://localhost:3000/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId: userData.deviceId,
                    score: 1000,
                    level: 1
                })
            });

            if (!scoreResponse.ok) {
                const error = await scoreResponse.text();
                throw new Error(`Failed to submit score: ${error}`);
            }

            const scoreData = await scoreResponse.json();
            console.log('Score submission response:', scoreData);

            console.log('Fetching leaderboard...');
            // Get leaderboard
            const leaderboardResponse = await fetch('http://localhost:3000/api/leaderboard');
            
            if (!leaderboardResponse.ok) {
                const error = await leaderboardResponse.text();
                throw new Error(`Failed to fetch leaderboard: ${error}`);
            }

            const leaderboardData = await leaderboardResponse.json();
            console.log('Leaderboard data:', leaderboardData);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLeaderboard(); 