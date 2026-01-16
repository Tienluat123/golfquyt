// Quy ước điểm số cho từng Band
const BAND_MAP = {
  "1_2": 1,
  "2_4": 2,
  "4_6": 3,
  "6_8": 4,
  "8_10": 5
};

const SCORE_MAP = {
  1: "1_2",
  2: "2_4",
  3: "4_6",
  4: "6_8",
  5: "8_10"
};

exports.convertBandToPoint = (bandString) => {
  const key = bandString.replace('-', '_'); // Đề phòng frontend gửi "8-10"
  return BAND_MAP[key] || 1; // Mặc định là 1 nếu không tìm thấy
};

exports.convertPointToBand = (point) => {
  const rounded = Math.round(point);
  const safePoint = Math.max(1, Math.min(5, rounded));
  return SCORE_MAP[safePoint] || "1_2";
};

exports.estimateScoreFromBand = (bandString) => {
    const point = exports.convertBandToPoint(bandString);
    return point * 20 - 10; 
};
