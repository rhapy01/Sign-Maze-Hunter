# Leaderboard Data Reference

## What We Record in the Leaderboard

### Core Game Statistics
- **Score**: Total points earned during gameplay
- **Level**: Highest level reached in that game session  
- **Game Time**: Duration of the game session (in seconds)
- **Enemies Defeated**: Number of enemies killed during the game
- **Treasures Found**: Number of treasure chests collected

### Player Identity (Anonymous System)
- **Player Name**: Display name chosen by the player
- **Device ID**: Unique 64-character identifier for the device/browser
- **Verification Status**: Whether the player has been verified
- **Device Fingerprint**: Browser characteristics for security
- **IP Address History**: For verification and anti-fraud
- **Account Timestamps**: Creation date and last activity

### Leaderboard Display Features
- **Ranking**: Position on the leaderboard (1st, 2nd, 3rd, etc.)
- **Verification Badge**: ✓ for verified users, ? for unverified
- **Formatted Date**: When the score was achieved
- **Pagination**: 10 scores per page with navigation
- **Player Statistics**: Detailed stats available per player

### Security Features
- **Anti-Fraud System**: Prevents score manipulation and identity theft
- **Device Consistency**: Tracks device characteristics over time  
- **Score Limits**: Unverified users limited to 100,000 points
- **Duplicate Prevention**: Blocks identical submissions within 1 minute

### Player Benefits by Verification Status

#### Unverified Players
- Can submit scores up to 100,000 points
- Basic leaderboard participation
- Anonymous identity protection

#### Verified Players  
- Unlimited score submissions
- Verification badge (✓) on leaderboard
- Enhanced credibility
- Protection against impersonation

## GitHub Repository
- **Repository**: rhapy01/Sign-Maze-Hunter
- **Game Title**: Sign Vanguard - Treasure Maze Adventure
- **Main Menu**: Includes leaderboard link at `mainmenu.html` line 139

## Quick Links
- Main Game: `index.html`
- Leaderboard: `leaderboard.html` 
- Main Menu: `mainmenu.html` (includes leaderboard link)
- Documentation: `ANONYMOUS_USER_SYSTEM.md` 