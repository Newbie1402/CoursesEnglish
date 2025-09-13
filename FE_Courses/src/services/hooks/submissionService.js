import api from '../api';

export const getSubmissionsList = async (examId) => {
    try {
        const res = await api.get(`/api/submissions/exam/${examId}`);
        return res.data?.data || [];
    } catch (err) {
        console.error("Error fetching submission details:", err);
        return [];
    }
}

export const getSubmissionDetail = async (submissionId) => {
    try {
        const res = await api.get(`/api/submissions/${submissionId}`);
        return res.data?.data || {};
    } catch (err) {
        console.error("Error fetching submission details:", err);
        return {};
    }
}

export const getSubmissionAnswer = async (submissionId) => {
    try {
        const res = await api.get(`/api/submissions/${submissionId}/answers`);
        return res.data?.data || [];
    } catch (err) {
        console.error("Error fetching submission answers:", err);
        return [];
    }
}

export const getSubmissionStudent = async (studentId) => {
    try {
        const res = await api.get(`/api/submissions/student/${studentId}`);
        return res.data?.data || [];
    } catch (err) {
        console.error("Error fetching submission student:", err);
        return {};
    }
}

export const gradeAnswer = async (answerId, score, feedback) => {
    try {
        const res = await api.patch(`/api/submissions/answers/${answerId}/grade`,
            {
                score,
                feedback});
        return res.data || {};
    } catch (err) {
        console.error(`Error grading submission ${answerId}:`, err);
        return {};
    }
};

export const deleteSubmission = async (submissionId) => {
    try {
        const res = await api.delete(`/api/submissions/${submissionId}`);
        return res.data || {};
    } catch (err) {
        console.error(`Error deleting submission ${submissionId}:`, err);
        return {};
    }
}

export const updateSubmission = async (submissionId) => {
    try {
        const res = await api.patch(`/api/submissions/${submissionId}/update`);
        return res.data || {};
    } catch (err) {
        console.error(`Error updating submission ${submissionId}:`, err);
        return {};
    }
}

export const notAttempts = async (examId) => {
    try {
        const res = await api.get(`/api/submissions/not-attempted/exam/${examId}`);
        return res.data?.data || [];
    } catch (err) {
        console.error("Error fetching not attempts students:", err);
        return [];
    }
}
/**
 *  API FOR ROLE STUDENT
 *  - startExam: Bắt đầu bài kiểm tra
 *  - finishExam: Kết thúc bài kiểm tra
 *  - createAnswers: Thêm câu trả lời mới cho bài nộp
 *  - checkStatusSubmission: Kiểm tra còn thời gian làm bài không
 *  - updateAnswer: Cập nhật câu trả lời đã nộp
 *  - deleteAnswer: Xóa câu trả lời đã nộp
 *  **/

export const startExam = async (examId, studentId, password) => {
    try {
        const res = await api.post(`/api/submissions/start-exam?examId=${examId}&studentId=${studentId}&password=${password}`);
        return res.data?.data || {};
    } catch (err) {
        console.error(`Error starting exam ${examId} from studentId ${studentId} with password ${password}:`, err);
        return {};
    }
}

export const finishExam = async (submissionId) => {
    try {
        const res = await api.post(`/api/submissions/${submissionId}/finish`);
        return res.data?.data || {};
    } catch (err) {
        console.error(`Error finishing exam with submission ${submissionId}:`, err);
        return {};
    }
}

export const createAnswers = async (questionId, studentAnswer, submissionId) => {
    try {
        const res = await api.post(`/api/submissions/${submissionId}/answers`, { questionId ,studentAnswer });
        return res.data?.data || {};
    } catch (err) {
        console.error(`Error submitting answers for submission ${submissionId}:`, err);
        return {};
    }
}

export const updateAnswer = async (answerId, studentAnswer) => {
    try {
        const res = await api.put(`/api/submission-answers/${answerId}`, { studentAnswer });
        return res.data?.data || {};
    } catch (err) {
        console.error(`Error updating answers ${answerId}:`, err);
        return {};
    }
}

export const deleteAnswer = async (answerId) => {
    try {
        const res = await api.delete(`/api/submission-answers/${answerId}`);
        return res.data || {};
    } catch (err) {
        console.error(`Error deleting answers ${answerId}:`, err);
        return {};
    }
}

export const checkStatusSubmission = async (submissionId) => {
    try {
        const res = await api.get(`/api/submissions/${submissionId}/status`);
        return res?.data || {};
    } catch (err) {
        console.error(`Error checking time remaining for submission ${submissionId}:`, err);
        return {};
    }
}

/**
 * Ghi lại hành động lựa chọn 1 hoặc nhiều lần (một request chứa mảng 1 phần tử)
 * @param {Array<{userId:number,quizId:number,questionId:number,actionType:string,choiceId:number,choiceIndex:number,currentChoices:number[]}>} actions
 * @returns {Promise<{statusCode:number,message:string,data:any}>}
 */
export const trackChoiceAction = async (actions) => {
    try {
        // Backward compatibility: nếu truyền tham số lẻ thay vì mảng, chuyển đổi
        if (!Array.isArray(actions)) {
            const [userId, quizId, questionId, actionType, choiceId, choiceIndex, currentChoices] = arguments; // eslint-disable-line prefer-rest-params
            actions = [{
                userId,
                quizId,
                questionId,
                actionType,
                choiceId,
                choiceIndex,
                currentChoices: Array.isArray(currentChoices) ? currentChoices : []
            }];
        }
        const res = await api.post(`/api/submission-answers/track-choice`, actions);
        return res?.data || {};
    } catch (err) {
        console.error(`Error tracking choice actions:`, err);
        return {};
    }
}

/**
 * Ghi lại hàng loạt nhiều hành động trong một batch (mảng nhiều phần tử)
 * @param {Array<{userId:number,quizId:number,questionId:number,actionType:string,choiceId:number,choiceIndex:number,currentChoices:number[]}>} actions
 * @returns {Promise<{statusCode:number,message:string,data:any}>}
 */
export const trackChoiceActionBatch = async (actions = []) => {
    try {
        if (!Array.isArray(actions)) {
            console.warn('trackChoiceActionBatch expects an array.');
            return {};
        }
        const res = await api.post(`/api/submission-answers/track-choices/batch`, actions);
        return res?.data || {};
    } catch (err) {
        console.error(`Error tracking batch choice actions:`, err);
        return {};
    }
}