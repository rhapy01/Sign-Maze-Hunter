# Sign Vanguard - Treasure Maze Adventure

A web-based treasure hunting maze game with leaderboard functionality and enhanced enemy AI system.

## Features

- 🎮 **Interactive Maze Game**: Navigate through procedurally generated mazes
- 🏆 **Global Leaderboard**: Track high scores with MongoDB backend
- 👾 **Enhanced Enemy System**: 10 different enemy types with unique behaviors
- 🎵 **Dynamic Audio**: Immersive sound effects and background music
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Real-time Updates**: Live leaderboard with pagination
- 📊 **Player Statistics**: Detailed player performance tracking

## Game Controls

- **Arrow Keys** or **WASD**: Move player
- **Space**: Attack/Interact
- **M**: Toggle music
- **P**: Pause game
- **Escape**: Return to menu

## Enemy Types

The game features 10 unique enemy types across different rarity tiers:

### Common Enemies (Levels 1-15)
- **Chaser**: Relentless pursuers that never give up
- **Dodger**: Fast and evasive, changes direction unpredictably

### Intermediate Enemies (Levels 10-30)
- **Ninja**: Stealthy assassins that can phase through walls
- **Melee**: Heavy fighters with high health and damage

### Advanced Enemies (Levels 20-40)
- **Elite Chaser**: Enhanced chasers with extended vision
- **Shadow Dodger**: Master dodgers with invisibility

### Elite Enemies (Levels 30-45)
- **Master Ninja**: Elite ninjas with teleportation abilities
- **Berserker Melee**: Enraged fighters that get stronger when damaged

### Legendary Enemies (Levels 40+)
- **Apex Hunter**: Ultimate predator with all abilities
- **Void Guardian**: Ancient guardians that command lesser enemies

## Technology Stack

- **Frontend**: HTML5 Canvas, JavaScript ES6+, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Render (PaaS)

## Deployment on Render

### Prerequisites
1. **MongoDB Database**: Set up a MongoDB Atlas cluster or other MongoDB hosting service
2. **Render Account**: Sign up at [render.com](https://render.com)

### Step-by-Step Deployment

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/yourusername/sign_vanguard.git
   cd sign_vanguard
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository

3. **Configure Web Service**
   - **Name**: `sign-vanguard` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: Select latest LTS (18.x or higher)

4. **Set Environment Variables**
   In the Render dashboard, go to Environment and add:
   
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sign_vanguard
   NODE_ENV=production
   ```

   Replace the MongoDB URI with your actual connection string.

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - The build process will install dependencies and start the server

6. **Update CORS Configuration**
   After deployment, update the CORS origin in `server.js`:
   ```javascript
   origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-app-name.onrender.com'] // Replace with your actual Render URL
       : ['http://localhost:3000', 'http://127.0.0.1:3000'],
   ```

### Environment Variables

The server requires only one environment variable:

- `MONGODB_URI`: Your MongoDB connection string
- `NODE_ENV`: Set to 'production' for production deployment (optional)

### MongoDB Setup

1. **Create MongoDB Atlas Account** (if using Atlas)
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a free cluster

2. **Configure Database Access**
   - Create a database user
   - Whitelist IP addresses (0.0.0.0/0 for Render)

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` and `<dbname>` with your values

### Custom Domain (Optional)

1. In Render dashboard, go to Settings
2. Add your custom domain
3. Configure DNS records as instructed

## Local Development

1. **Install Dependencies**
```bash
npm install
```

2. **Set Environment Variables**
   Create a `.env` file:
```
   MONGODB_URI=mongodb://localhost:27017/sign_vanguard
NODE_ENV=development
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Access Application**
   - Game: http://localhost:3000
   - Leaderboard: http://localhost:3000/leaderboard

## API Endpoints

### Leaderboard
- `GET /api/leaderboard?page=1&limit=10` - Get paginated leaderboard
- `POST /api/leaderboard` - Submit new score

### Player Statistics
- `GET /api/player/:playerName/stats` - Get player statistics

### Health Check
- `GET /api/health` - Server health status

## File Structure

```
sign_vanguard/
├── server.js              # Express server with MongoDB
├── package.json           # Dependencies and scripts
├── index.html            # Main game page
├── leaderboard.html      # Leaderboard page
├── mainmenu.html         # Main menu page
├── leaderboard.js        # Leaderboard functionality
├── enemies.js            # Enemy system and AI
├── players.js            # Player mechanics
├── weapon.js             # Weapon system
├── audio.js              # Audio management
├── hero/                 # Player sprite assets
├── sp2/                  # Enemy sprite assets (Owlet)
├── sp3/                  # Enemy sprite assets (Dude)
└── img/                  # Game images and UI assets
```

## Game Statistics Tracking

The leaderboard tracks:
- **Score**: Points earned during gameplay
- **Level**: Highest level reached
- **Game Time**: Total time played (seconds)
- **Enemies Defeated**: Number of enemies killed
- **Treasures Found**: Number of treasures collected
- **Date**: When the score was achieved

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
1. Check the [Issues](https://github.com/yourusername/sign_vanguard/issues) page
2. Create a new issue with detailed description
3. Include browser/device information for bugs

## Version History

- **v1.0.0**: Initial release with basic gameplay
- **v1.1.0**: Added leaderboard functionality
- **v1.2.0**: Enhanced enemy system with 10 enemy types
- **v1.3.0**: Server deployment and MongoDB integration

---

Enjoy playing Sign Vanguard! 🎮✨ 