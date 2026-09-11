import { generateInsight } from '../../ai/insight.js';
import * as userRepo from './user.repository.js';

const getProfile = async (local_code) => {
    const result = await userRepo.findByLocalCode(local_code);

    if (!result) {
        const error = new Error('존재하지 않는 지자체 코드입니다.');
        error.status = 404;
        error.code = 'LOCAL_CODE_NOT_FOUND'
        throw error;
    }

    return { local_code: result.local_code, num_toilet: result.num_toilet, role: result.role };
};

const getTotalData = async (local_code) => {
    const data1 = await userRepo.getUsageSummary(local_code);
    const data2 = await userRepo.getMonthlySurveyStats(local_code);

    return {usage: data1, survey : data2 };
};

const getMyToilets = async (local_code) => {
    return userRepo.getMyToilets(local_code);
};

const getUsage = async (local_code) => {
    return userRepo.getUsage(local_code);
};

const getSurvey = async (local_code) => {
    return userRepo.getSurvey(local_code);
}

const getInsights = async (local_code) => {
    const { usageLogs, surveyLogs } = await userRepo.getRawLogsForInsight(local_code);

    const insight = await generateInsight(usageLogs, surveyLogs);

    return { insight, usageCount: usageLogs.length, surveyCount: surveyLogs.length };
};

export { getProfile, getTotalData, getMyToilets, getUsage, getSurvey, getInsights };