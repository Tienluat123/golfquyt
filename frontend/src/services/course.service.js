import axiosClient from '../utils/axiosConfig';

export const getFeaturedCourses = (limit = 3) => {
    return axiosClient.get(`/courses?limit=${limit}`);
};

/**
 * Get all available courses
 */
export const getCourses = async () => {
    try {
        const response = await axiosClient.get('/courses');
        return response;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

/**
 * Get a specific course by ID
 */
export const getCourseById = async (courseId) => {
    try {
        const response = await axiosClient.get(`/courses/${courseId}`);
        return response;
    } catch (error) {
        console.error('Error fetching course:', error);
        throw error;
    }
};

/**
 * Get course checklist
 */
export const getCourseChecklist = async (courseId) => {
    try {
        const response = await axiosClient.get(`/courses/${courseId}/checklist`);
        return response;
    } catch (error) {
        console.error('Error fetching course checklist:', error);
        throw error;
    }
};

/**
 * Start a course training session
 */
export const startCourseTraining = async (courseId) => {
    try {
        const response = await axiosClient.post(`/courses/${courseId}/start`);
        return response;
    } catch (error) {
        console.error('Error starting course:', error);
        throw error;
    }
};

/**
 * Submit training step completion
 */
export const submitTrainingStep = async (courseId, stepId, data) => {
    try {
        const response = await axiosClient.post(`/courses/${courseId}/steps/${stepId}`, data);
        return response;
    } catch (error) {
        console.error('Error submitting training step:', error);
        throw error;
    }
};

/**
 * Complete a course
 */
export const completeCourse = async (courseId, sessionData) => {
    try {
        const response = await axiosClient.post(`/courses/${courseId}/complete`, sessionData);
        return response;
    } catch (error) {
        console.error('Error completing course:', error);
        throw error;
    }
};

/**
 * Get user's course progress
 */
export const getUserCourseProgress = async (courseId) => {
    try {
        const response = await axiosClient.get(`/courses/${courseId}/progress`);
        return response;
    } catch (error) {
        console.error('Error fetching course progress:', error);
        throw error;
    }
};
