const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/golf-app');
        console.log('Connected to MongoDB');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses:`);
        courses.forEach(c => {
            console.log(`ID: ${c._id}`);
            console.log(`  Title: ${c.title}`);
            console.log(`  Training Steps: ${c.trainingSteps ? c.trainingSteps.length : 0}`);
            if (c.trainingSteps && c.trainingSteps.length > 0) {
                console.log(`  First Step: ${c.trainingSteps[0].title}`);
                console.log(`  Last Step: ${c.trainingSteps[c.trainingSteps.length - 1].title}`);
            }
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

checkCourses();
