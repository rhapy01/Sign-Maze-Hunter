# Anonymous User System Documentation

## Problem Solved

The original leaderboard system allowed anyone to submit scores under any name, leading to:
- **Identity impersonation**: Players could submit fake scores under other players' names
- **No verification**: No way to verify legitimate scores vs fake ones
- **Multiple submissions**: Same person could submit under different names
- **No player tracking**: No consistent way to track individual players

## Solution: Anonymous User System

Our system provides identity consistency **without requiring user registration** through:

### 🔐 Device-Based Identity
- **Unique Device IDs**: Each browser/device gets a cryptographically secure unique identifier
- **Browser Fingerprinting**: Uses device characteristics (screen resolution, timezone, user agent) for additional verification
- **IP Tracking**: Monitors IP addresses associated with each device for consistency checks

### ✅ Verification System
- **Unverified Users**: Can submit scores up to 100,000 points
- **Verified Users**: Can submit unlimited scores after passing verification
- **Verification Process**: Based on consistent device characteristics and IP addresses

### 🛡️ Anti-Fraud Measures
- **Duplicate Prevention**: Prevents identical score submissions within 1 minute
- **Device Consistency**: Tracks device fingerprints to detect suspicious activity
- **Score Limits**: High scores from unverified users require verification
- **IP Correlation**: Cross-references IP addresses with device IDs

## How It Works

### 1. User Registration/Identification
```javascript
// Frontend calls when player enters name
await identifyUser(playerName)
```

**Process:**
1. Generate browser fingerprint (screen, timezone, language, etc.)
2. Check for existing device ID in localStorage
3. Send to server with player name
4. Server checks for existing user with same name/fingerprint/IP
5. Returns existing user OR creates new anonymous user
6. Device ID stored in localStorage for future sessions

### 2. Score Submission
```javascript
// Enhanced score submission with device verification
await submitScore(playerName, score, level, gameStats)
```

**Process:**
1. Automatically identify/register user first
2. Verify device ID matches registered user
3. Check for recent duplicate submissions
4. Apply score limits for unverified users
5. Store score with verification status

### 3. User Verification
```javascript
// Optional verification for enhanced privileges
await verifyUser()
```

**Process:**
1. Check device consistency (IP, user agent, fingerprint)
2. Mark user as verified if characteristics match
3. Unlock higher score submission limits
4. Add verification badge to leaderboard

## Database Schema

### AnonymousUser Collection
```javascript
{
  deviceId: "64-character-hex-string",     // Unique device identifier
  playerName: "PlayerName",               // Player's chosen name
  fingerprint: {                          // Device characteristics
    userAgent: "Mozilla/5.0...",
    screenResolution: "1920x1080",
    timezone: "America/New_York",
    language: "en-US",
    platform: "Win32"
  },
  ipAddresses: [{                         // IP history
    ip: "192.168.1.1",
    firstSeen: Date,
    lastSeen: Date
  }],
  isVerified: false,                      // Verification status
  createdAt: Date,                        // Account creation
  lastActive: Date                        // Last activity
}
```

### Leaderboard Collection
```javascript
{
  deviceId: "64-character-hex-string",     // Links to AnonymousUser
  playerName: "PlayerName",               // Player name (cached)
  score: 50000,                           // Game score
  level: 25,                              // Level reached
  gameTime: 1800,                         // Seconds played
  enemiesDefeated: 150,                   // Combat stats
  treasuresFound: 8,                      // Collection stats
  isVerified: false,                      // Verification at submission
  submissionFingerprint: {                // Submission metadata
    userAgent: "Mozilla/5.0...",
    ip: "192.168.1.1",
    timestamp: Date
  },
  createdAt: Date                         // Submission time
}
```

## API Endpoints

### User Management
- `POST /api/user/identify` - Register or identify anonymous user
- `POST /api/user/verify` - Verify user based on device consistency

### Leaderboard
- `GET /api/leaderboard` - Get scores with verification status
- `POST /api/leaderboard` - Submit score (requires device ID)
- `GET /api/player/:deviceId/stats` - Get player statistics

### Monitoring
- `GET /api/health` - Server and database status

## Frontend Integration

### Automatic User Registration
```javascript
// When submitting score, user is automatically registered
window.leaderboardAPI.submitScore(playerName, score, level, {
  gameTime: 1800,
  enemiesDefeated: 150,
  treasuresFound: 8
});
```

### Manual Verification
```javascript
// Player can verify their account for higher score limits
window.leaderboardAPI.verifyUser();
```

### Current User Info
```javascript
// Get current user information
const user = window.leaderboardAPI.getCurrentUser();
console.log(user.playerName, user.isVerified);
```

## Security Features

### 1. Device Consistency Tracking
- Monitors changes in device characteristics
- Flags suspicious activity (different fingerprints)
- Correlates IP addresses with device usage

### 2. Score Validation
- Unverified users limited to 100,000 points
- Recent duplicate submissions blocked (1-minute window)
- High scores require verification prompt

### 3. Privacy Protection
- No personal information required
- IP addresses used only for verification
- Device fingerprints are non-personally identifiable

### 4. Anti-Spoofing
- Multiple verification factors (IP + fingerprint + consistency)
- Historical tracking of device characteristics
- Server-side validation of all submissions

## User Experience

### For New Players
1. Enter player name
2. Automatically registered as anonymous user
3. Can submit scores immediately (up to 100K)
4. Optional verification for unlimited scores

### For Returning Players
1. Same device automatically recognized
2. Previous scores and stats accessible
3. Name consistency enforced
4. Verification status maintained

### Verification Benefits
- ✅ Unlimited score submissions
- ✅ Verification badge on leaderboard
- ✅ Enhanced credibility
- ✅ Protection against impersonation

## Privacy & Data Protection

### Data Collected
- Player name (chosen by user)
- Device characteristics (non-personal)
- IP addresses (for verification only)
- Game statistics

### Data NOT Collected
- Email addresses
- Real names
- Personal information
- Tracking across websites

### Data Retention
- User data kept indefinitely for game continuity
- IP addresses purged after 90 days of inactivity
- Player can request data deletion

## Deployment Considerations

### Environment Variables
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sign_vanguard
NODE_ENV=production
```

### CORS Configuration
```javascript
// Update with your actual Render URL
origin: ['https://your-app-name.onrender.com']
```

### Database Indexes
- `deviceId` (unique)
- `playerName + deviceId` (compound)
- `score + createdAt` (leaderboard sorting)
- `ipAddresses.ip` (verification)

## Monitoring & Maintenance

### Health Checks
- `/api/health` endpoint monitors database connectivity
- Server automatically retries MongoDB connections
- Graceful degradation when database unavailable

### Anti-Fraud Monitoring
- Track verification rates
- Monitor high score submissions
- Alert on suspicious patterns

### Performance Optimization
- Database indexes for fast queries
- Pagination for large leaderboards
- Efficient aggregation pipelines

## Future Enhancements

### Planned Features
- **Social Features**: Friend systems using device IDs
- **Achievement System**: Track accomplishments per device
- **Tournament Mode**: Verified-only competitions
- **Appeal System**: Manual verification for edge cases

### Security Improvements
- **Machine Learning**: Detect cheating patterns
- **Rate Limiting**: Prevent spam submissions
- **Captcha Integration**: For suspicious activity
- **Advanced Fingerprinting**: More device characteristics

## Conclusion

The Anonymous User System provides a perfect balance between:
- **Ease of Use**: No registration required
- **Identity Consistency**: Reliable player tracking
- **Fraud Prevention**: Multiple verification layers
- **Privacy Protection**: Minimal data collection

This system ensures fair competition while maintaining user privacy and eliminating the need for complex registration flows. 