const User = require('../models/User');

const calculateRankInfo = (totalPoints) => {
  // Quy định các mốc điểm
  if (totalPoints < 1000) {
    return { 
      rankTitle: "Beginner", 
      nextLevelXp: 1000, 
      currentLevelXp: totalPoints // 500 / 1000
    };
  } else if (totalPoints < 3000) {
    return { 
      rankTitle: "Amateur", 
      nextLevelXp: 3000, 
      currentLevelXp: totalPoints // Ví dụ 1500 / 3000
    };
  } else if (totalPoints < 6000) {
    return { 
      rankTitle: "Semi-Pro", 
      nextLevelXp: 6000, 
      currentLevelXp: totalPoints 
    };
  } else {
    return { 
      rankTitle: "Master", 
      nextLevelXp: 10000, 
      currentLevelXp: totalPoints 
    };
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const rankInfo = calculateRankInfo(user.experiencePoints || 0);
    res.json({
      username: user.username,
      location: user.location,
      rankTitle: rankInfo.rankTitle,
      xp: rankInfo.currentLevelXp,
      nextLevelXp: rankInfo.nextLevelXp,
      avatar: user.avatar
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
