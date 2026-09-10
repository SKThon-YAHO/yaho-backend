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

const getDashboard = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;

        const dashboard = await userService.getDashboard(local_code);

        return res.status(200).json({ success: true, data: dashboard });
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
        const period = req.query.period || 'day'; // day | week | month, 기본값 day
         if (!local_code || !period) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }
        const usage = await userService.getUsage(local_code, period);

        return res.status(200).json({ success: true, data: usage });
    } catch (error) {
        next(error);
    }
};

export { getMyProfile, getDashboard, getMyToilets, getUsage };