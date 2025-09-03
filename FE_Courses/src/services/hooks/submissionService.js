import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getSubmissionsList = async (examId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/submissions/exam/${examId}`);
        return res.data?.data || [];
    } catch (err) {
        console.error("Error fetching submission details:", err);
        return [];
    }
}

export const getSubmissionDetail = async (submissionId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/submissions/${submissionId}`);
        return res.data?.data || {};
    } catch (err) {
        console.error("Error fetching submission details:", err);
        return {};
    }
}

export const getSubmissionAnswer = async (submissionId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/submissions/${submissionId}/answers`);
        return res.data?.data || [];
    } catch (err) {
        console.error("Error fetching submission answers:", err);
        return [];
    }
}

export const gradeAnswer = async (answerId, score, feedback) => {
    try {
        const res = await axios.patch(`${BASE_URL}/api/submissions/answers/${answerId}/grade`,
            {
                score,
                feedback});
        return res.data || {};
    } catch (err) {
        console.error(`Error grading submission ${answerId}:`, err);
        return {};
    }
};