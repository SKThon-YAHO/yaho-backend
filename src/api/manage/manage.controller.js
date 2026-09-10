import * as manageService from './manage.service.js';

const addCleaningLog = async (req, res, next) => {
    try {
        const local_code = req.user.local_code;
        const { toilet_code } = req.params;
        const { cleaning_type } = req.body;

        if (!toilet_code || !cleaning_type) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        await manageService.addCleaningLog({ local_code, toilet_code, cleaning_type });

        return res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
};

export { addCleaningLog };