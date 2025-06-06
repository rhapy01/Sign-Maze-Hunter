const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

// Load environment variables for local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for Render deployment
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://sign-maze-hunter.onrender.com'] // Your actual Render app URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(__dirname));

// MongoDB connection with better error handling
const connectDB = async () => {
    try {
        // Render will provide MONGODB_URI environment variable
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL;
        
        if (!mongoURI) {
            throw new Error('MongoDB connection string not provided in environment variables');
        }

        // Strategy 1: Standard secure connection
        const primaryOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
            tls: true,
            tlsAllowInvalidCertificates: false,
            authSource: 'admin',
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            connectTimeoutMS: 10000
        };

        // Strategy 2: Relaxed SSL validation
        const fallbackOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
            retryWrites: true,
            w: 'majority'
        };

        // Strategy 3: No SSL enforcement (last resort)
        const noSSLOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            tls: false,
            retryWrites: true,
            w: 'majority'
        };

        try {
            // Try primary connection first
            await mongoose.connect(mongoURI, primaryOptions);
            console.log('✅ Connected to MongoDB successfully (secure connection)');
            return;
        } catch (primaryError) {
            console.log('⚠️ Primary SSL connection failed, trying fallback...');
            
            try {
                // Try fallback with relaxed SSL
                await mongoose.connect(mongoURI, fallbackOptions);
                console.log('✅ Connected to MongoDB successfully (fallback connection)');
                return;
            } catch (fallbackError) {
                console.log('⚠️ Fallback SSL connection failed, trying without SSL...');
                
                // Last resort: try with modified URI (remove SSL requirement)
                const noSSLUri = mongoURI.replace('ssl=true', 'ssl=false').replace('&ssl=true', '');
                
                try {
                    await mongoose.connect(noSSLUri, noSSLOptions);
                    console.log('✅ Connected to MongoDB successfully (no SSL connection)');
                    return;
                } catch (noSSLError) {
                    console.error('❌ All connection strategies failed');
                    console.error('Primary error:', primaryError.message);
                    console.error('Fallback error:', fallbackError.message);
                    console.error('No SSL error:', noSSLError.message);
                    throw noSSLError;
                }
            }
        }
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        // Don't exit the process, let it retry
        setTimeout(connectDB, 5000); // Retry after 5 seconds
    }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('📡 MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('💥 MongoDB error:', err);
});

// Connect to database
connectDB();

// Anonymous User Schema for tracking players without registration
const anonymousUserSchema = new mongoose.Schema({
    deviceId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    signId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: /^SIGN[A-Z]{4}$/,
        default: function() {
            return generateSignId();
        }
    },
    playerName: { 
        type: String, 
        required: false,
        trim: true,
        maxlength: 50,
        default: function() {
            return this.signId;
        }
    },
    fingerprint: {
        userAgent: String,
        screenResolution: String,
        timezone: String,
        language: String,
        platform: String
    },
    ipAddresses: [{
        ip: String,
        firstSeen: { type: Date, default: Date.now },
        lastSeen: { type: Date, default: Date.now }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add compound index for better queries
anonymousUserSchema.index({ playerName: 1, deviceId: 1 });
anonymousUserSchema.index({ 'ipAddresses.ip': 1 });

const AnonymousUser = mongoose.model('AnonymousUser', anonymousUserSchema);

// Enhanced Leaderboard Schema with user reference
const leaderboardSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        ref: 'AnonymousUser'
    },
    playerName: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 50
    },
    score: { 
        type: Number, 
        required: true,
        min: 0,
        max: 999999999
    },
    level: { 
        type: Number, 
        required: true,
        min: 1,
        max: 100
    },
    gameTime: {
        type: Number,
        default: 0,
        min: 0
    },
    enemiesDefeated: {
        type: Number,
        default: 0,
        min: 0
    },
    treasuresFound: {
        type: Number,
        default: 0,
        min: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    submissionFingerprint: {
        userAgent: String,
        ip: String,
        timestamp: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

// Add indexes for better performance
leaderboardSchema.index({ score: -1, createdAt: -1 });
leaderboardSchema.index({ deviceId: 1, createdAt: -1 });
leaderboardSchema.index({ playerName: 1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Middleware for request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Helper function to generate device ID
function generateDeviceId() {
    return crypto.randomBytes(32).toString('hex');
}

// Helper function to generate unique SIGN ID
function generateSignId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let uniqueId = 'SIGN';
    for (let i = 0; i < 4; i++) {
        uniqueId += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return uniqueId;
}

// Helper function to get client fingerprint
function getClientFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    return crypto.createHash('sha256')
        .update(userAgent + acceptLanguage + acceptEncoding)
        .digest('hex')
        .substring(0, 16);
}

// Helper function to get client IP
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
}

// Register or identify anonymous user
app.post('/api/user/identify', async (req, res) => {
    try {
        const { 
            fingerprint = {},
            existingDeviceId 
        } = req.body;

        const clientIP = getClientIP(req);
        const clientFingerprint = getClientFingerprint(req);

        let user;

        // If existing device ID provided, try to find user
        if (existingDeviceId) {
            user = await AnonymousUser.findOne({ deviceId: existingDeviceId });
            
            if (user) {
                // Update last active and IP if needed
                user.lastActive = new Date();
                
                // Check if this IP is already recorded
                const existingIP = user.ipAddresses.find(ip => ip.ip === clientIP);
                if (existingIP) {
                    existingIP.lastSeen = new Date();
                } else {
                    user.ipAddresses.push({
                        ip: clientIP,
                        firstSeen: new Date(),
                        lastSeen: new Date()
                    });
                }

                await user.save();
                
                return res.json({
                    deviceId: user.deviceId,
                    signId: user.signId,
                    isVerified: user.isVerified,
                    isExisting: true
                });
            }
        }

        // Generate new SIGN ID and ensure it's unique
        let signId;
        let isUnique = false;
        while (!isUnique) {
            signId = generateSignId();
            const existingUser = await AnonymousUser.findOne({ signId });
            if (!existingUser) {
                isUnique = true;
            }
        }

        // Create new anonymous user
        const deviceId = generateDeviceId();
        
        user = new AnonymousUser({
            deviceId,
            signId,
            fingerprint: {
                userAgent: req.headers['user-agent'] || '',
                screenResolution: fingerprint.screenResolution || '',
                timezone: fingerprint.timezone || '',
                language: fingerprint.language || '',
                platform: fingerprint.platform || ''
            },
            ipAddresses: [{
                ip: clientIP,
                firstSeen: new Date(),
                lastSeen: new Date()
            }],
            isVerified: false
        });

        await user.save();

        console.log(`✅ New anonymous user created: ${signId} (${deviceId})`);

        res.status(201).json({
            deviceId: user.deviceId,
            signId: user.signId,
            isVerified: user.isVerified,
            isExisting: false
        });

    } catch (error) {
        console.error('Error identifying user:', error);
        res.status(500).json({ 
            error: 'Failed to identify user',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Verify user ownership (basic challenge-response)
app.post('/api/user/verify', async (req, res) => {
    try {
        const { deviceId, challenge } = req.body;

        if (!deviceId) {
            return res.status(400).json({ error: 'Device ID is required' });
        }

        const user = await AnonymousUser.findOne({ deviceId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Simple verification based on consistent device characteristics
        const clientIP = getClientIP(req);
        const hasMatchingIP = user.ipAddresses.some(ip => ip.ip === clientIP);
        const userAgent = req.headers['user-agent'] || '';
        const hasMatchingUA = user.fingerprint.userAgent === userAgent;

        if (hasMatchingIP || hasMatchingUA) {
            user.isVerified = true;
            user.lastActive = new Date();
            await user.save();

            res.json({
                verified: true,
                message: 'User verified successfully'
            });
        } else {
            res.status(403).json({
                verified: false,
                message: 'Unable to verify user identity'
            });
        }

    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: 'Failed to verify user' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    };
    res.json(healthStatus);
});

// Get leaderboard with verification status
app.get('/api/leaderboard', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        
        const total = await Leaderboard.countDocuments();
        
        // Get scores with user verification status
        const scores = await Leaderboard.aggregate([
            {
                $lookup: {
                    from: 'anonymoususers',
                    localField: 'deviceId',
                    foreignField: 'deviceId',
                    as: 'user'
                }
            },
            {
                $addFields: {
                    isUserVerified: { $arrayElemAt: ['$user.isVerified', 0] }
                }
            },
            {
                $project: {
                    playerName: 1,
                    score: 1,
                    level: 1,
                    gameTime: 1,
                    enemiesDefeated: 1,
                    treasuresFound: 1,
                    createdAt: 1,
                    isVerified: 1,
                    isUserVerified: 1
                }
            },
            { $sort: { score: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        res.json({
            scores,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: scores.length,
                totalScores: total
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ 
            error: 'Failed to fetch leaderboard data',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Submit new score with user verification
app.post('/api/leaderboard', async (req, res) => {
    try {
        const { 
            deviceId,
            score, 
            level, 
            gameTime = 0, 
            enemiesDefeated = 0, 
            treasuresFound = 0 
        } = req.body;
        
        // Validate required fields
        if (!deviceId || score === undefined || !level) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['deviceId', 'score', 'level']
            });
        }

        // Verify user exists
        const user = await AnonymousUser.findOne({ deviceId });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please register first.' });
        }

        // Additional validation
        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({ error: 'Invalid score value' });
        }
        
        if (typeof level !== 'number' || level < 1) {
            return res.status(400).json({ error: 'Invalid level value' });
        }

        const clientIP = getClientIP(req);

        // Check for recent duplicate submissions
        const recentSubmission = await Leaderboard.findOne({
            deviceId: deviceId,
            score: score,
            createdAt: { $gte: new Date(Date.now() - 60000) } // Within last minute
        });

        if (recentSubmission) {
            return res.status(429).json({ 
                error: 'Duplicate submission detected. Please wait before submitting again.' 
            });
        }

        // Check for suspiciously high scores from unverified users
        if (!user.isVerified && score > 100000) {
            return res.status(403).json({
                error: 'High scores require user verification. Please verify your account first.'
            });
        }

        // Create new leaderboard entry
        const newScore = new Leaderboard({
            deviceId,
            playerName: user.signId, // Use SIGN ID as player name
            score,
            level,
            gameTime,
            enemiesDefeated,
            treasuresFound,
            isVerified: user.isVerified,
            submissionFingerprint: {
                userAgent: req.headers['user-agent'] || '',
                ip: clientIP,
                timestamp: new Date()
            }
        });

        const savedScore = await newScore.save();

        // Update user last active
        user.lastActive = new Date();
        await user.save();
        
        const responseScore = {
            _id: savedScore._id,
            playerName: savedScore.playerName,
            signId: user.signId,
            score: savedScore.score,
            level: savedScore.level,
            gameTime: savedScore.gameTime,
            enemiesDefeated: savedScore.enemiesDefeated,
            treasuresFound: savedScore.treasuresFound,
            createdAt: savedScore.createdAt,
            isVerified: savedScore.isVerified
        };

        console.log(`✅ New score saved: ${user.signId} - ${score} points (Level ${level}) [${user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}]`);
        res.status(201).json(responseScore);
        
    } catch (error) {
        console.error('Error saving score:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to save score',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get player statistics with verification status
app.get('/api/player/:deviceId/stats', async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const user = await AnonymousUser.findOne({ deviceId });
        if (!user) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const stats = await Leaderboard.aggregate([
            { $match: { deviceId: deviceId } },
            {
                $group: {
                    _id: '$deviceId',
                    playerName: { $first: '$playerName' },
                    totalGames: { $sum: 1 },
                    bestScore: { $max: '$score' },
                    averageScore: { $avg: '$score' },
                    highestLevel: { $max: '$level' },
                    totalEnemiesDefeated: { $sum: '$enemiesDefeated' },
                    totalTreasuresFound: { $sum: '$treasuresFound' },
                    totalGameTime: { $sum: '$gameTime' },
                    firstPlayed: { $min: '$createdAt' },
                    lastPlayed: { $max: '$createdAt' }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                deviceId: user.deviceId,
                playerName: user.playerName,
                isVerified: user.isVerified,
                totalGames: 0,
                message: 'No games played yet'
            });
        }

        const playerStats = {
            ...stats[0],
            isVerified: user.isVerified,
            accountCreated: user.createdAt,
            lastActive: user.lastActive
        };

        res.json(playerStats);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ error: 'Failed to fetch player statistics' });
    }
});

// Serve main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve leaderboard page
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// Serve main menu
app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'mainmenu.html'));
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
    // Check if it's an API route that doesn't exist
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Otherwise serve the main game
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
}); 