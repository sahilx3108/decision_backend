const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const session = require('express-session');
const passport = require('passport');

// Connect to database
connectDB();

// Initialize passport config
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'https://decision-intelli.vercel.app',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.set('trust proxy', 1); // Trust first proxy (Render)

// Session Middleware
app.use(session({
    secret: process.env.JWT_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true on Render
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-site
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/entity', require('./routes/entity'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/user', require('./routes/userRoutes'));

app.get('/', (req, res) => {
    res.send('Decision Intelligence API Running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
