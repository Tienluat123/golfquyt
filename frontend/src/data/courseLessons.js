// Golf Course Training Lessons
// Each course has a series of training slides that guide the user through the swing phase

export const COURSE_LESSONS = {
    1: [
        {
            stepIndex: 1,
            title: "Find Your Stance",
            instruction: "Stand with your feet about shoulder-width apart.",
            visualGuide: "Two footprint markers appear on screen showing ideal foot placement width",
            userAction: "Position your feet to match the markers and feel balanced on both feet"
        },
        {
            stepIndex: 2,
            title: "Bend Your Knees",
            instruction: "Add a slight flex to your knees like you are sitting on a tall stool.",
            visualGuide: "Side view showing proper knee bend angle with a guide line",
            userAction: "Bend your knees gently until you feel athletic and ready to move"
        },
        {
            stepIndex: 3,
            title: "Tilt From Your Hips",
            instruction: "Lean forward from your hips while keeping your back straight.",
            visualGuide: "Spine angle indicator showing the correct forward tilt from hips",
            userAction: "Hinge at your hips until your arms hang naturally below your shoulders"
        },
        {
            stepIndex: 4,
            title: "Let Your Arms Hang",
            instruction: "Allow your arms to hang down naturally without any tension.",
            visualGuide: "Front view highlighting relaxed arm position with alignment markers",
            userAction: "Shake out any tension and let your arms dangle freely from your shoulders"
        },
        {
            stepIndex: 5,
            title: "Check Your Balance",
            instruction: "Feel your weight evenly distributed across both feet.",
            visualGuide: "Pressure meter showing balanced weight distribution between feet",
            userAction: "Rock gently side to side then settle into a centered, balanced position"
        }
    ]
};

export default COURSE_LESSONS;
