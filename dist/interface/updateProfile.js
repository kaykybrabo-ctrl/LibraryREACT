"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = updateProfile;
const connection_1 = require("../DB/connection");
async function updateProfile(req, res) {
    // Check if user is authenticated
    const sessionUser = req.session?.user;
    if (!sessionUser) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    // Get username from body or use session user
    const username = req.body.username || sessionUser.username;
    const description = req.body.description || '';
    // Users can only edit their own profile, admins can edit any profile
    if (sessionUser.role !== 'admin' && sessionUser.username !== username) {
        return res.status(403).json({ error: 'You can only edit your own profile' });
    }
    try {
        let imageFilename = req.file?.filename;
        // If no new image uploaded, keep existing image
        if (!imageFilename) {
            const result = await (0, connection_1.executeQuery)('SELECT photo FROM users WHERE username = ? LIMIT 1', [username]);
            imageFilename = result.length > 0 ? result[0].photo : 'default-user.png';
        }
        // Update profile with new data
        await (0, connection_1.executeQuery)('UPDATE users SET photo = ?, description = ? WHERE username = ?', [imageFilename, description, username]);
        // Return updated profile data
        const updatedProfile = await (0, connection_1.executeQuery)('SELECT id, username, role, photo AS profile_image, description FROM users WHERE username = ? LIMIT 1', [username]);
        if (updatedProfile.length > 0) {
            const user = updatedProfile[0];
            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                profile_image: user.profile_image || 'default-user.png',
                description: user.description || ''
            });
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error('Database error in updateProfile:', error);
        res.status(500).json({ error: 'Database error' });
    }
}
//# sourceMappingURL=updateProfile.js.map