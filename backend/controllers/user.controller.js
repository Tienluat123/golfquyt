const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      location: user.location,
      rankTitle: user.rankTitle,
      xp: user.experiencePoints || 0,
      nextLevelXp: 2000,
      avatar: user.avatar
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
