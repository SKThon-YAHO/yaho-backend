import * as userService from './user.service.js';

const getMyProfile = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;

        const profile = await userService.getProfile(local_code);

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

const getTotalData = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;

        const data = await userService.getTotalData(local_code);

        return res.status(200).json({ success: true, data: data});
    } catch (error) {
        next(error);
    }
};

const getMyToilets = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;

        const toilets = await userService.getMyToilets(local_code);

        return res.status(200).json({ success: true, data: toilets });
    } catch (error) {
        next(error);
    }
};

const getUsage = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;
        const usage = await userService.getUsage(local_code);

        return res.status(200).json({ success: true, data: usage });
    } catch (error) {
        next(error);
    }
};

const getSurvey = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;

        const survey = await userService.getSurvey(local_code);

        return res.status(200).json({ success: true, data: survey });
    } catch (error) {
        next(error);
    }
};

const getInsights = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;
        const data = await userService.getInsights(local_code);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export { getMyProfile, getTotalData, getMyToilets, getUsage, getSurvey, getInsights };