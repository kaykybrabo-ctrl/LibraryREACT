"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
const connection_1 = require("../DB/connection");
async function getProfile(req, res) {
    // Check if user is authenticated
    const sessionUser = req.session?.user;
    if (!sessionUser) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    // Get username from query or use session user
    const username = req.query.username || sessionUser.username;
    // Users can only view their own profile, admins can view any profile
    if (sessionUser.role !== 'admin' && sessionUser.username !== username) {
        return res.status(403).json({ error: 'You can only view your own profile' });
    }
    try {
        const results = await (0, connection_1.executeQuery)('SELECT id, username, role, photo AS profile_image, description FROM users WHERE username = ? LIMIT 1', [username]);
        if (!results.length)
            return res.status(404).json({ error: 'User not found' });
        const user = results[0];
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            profile_image: user.profile_image || 'default-user.png',
            description: user.description || ''
        });
    }
    catch (error) {
        console.error('Database error in getProfile:', error);
        res.status(500).json({ error: 'Database error' });
    }
}
