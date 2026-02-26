const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${backendUrl}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        const email = (profile.emails && profile.emails[0].value) ? profile.emails[0].value : null;

        if (email) {
            user = await User.findOne({ email });
            if (user) {
                user.googleId = profile.id;
                if (!user.authProvider || user.authProvider === 'local') {
                    user.authProvider = 'google';
                }
                await user.save();
                return done(null, user);
            }
        }

        user = await User.create({
            name: profile.displayName || 'Google User',
            email: email,
            googleId: profile.id,
            authProvider: 'google'
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${backendUrl}/api/auth/github/callback`,
    scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
            return done(null, user);
        }

        let email = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null;

        if (email) {
            user = await User.findOne({ email });
            if (user) {
                user.githubId = profile.id;
                if (!user.authProvider || user.authProvider === 'local') {
                    user.authProvider = 'github';
                }
                await user.save();
                return done(null, user);
            }
        } else {
            email = `${profile.username}@github.com`; // Fallback if no email is public
        }

        user = await User.create({
            name: profile.displayName || profile.username,
            email: email,
            githubId: profile.id,
            authProvider: 'github'
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));
