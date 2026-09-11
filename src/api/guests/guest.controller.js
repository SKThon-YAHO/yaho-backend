import * as guestService from './guest.service.js';

const getRandomItem = async (req, res, next) => {
    try {
        const { uuid } = req.body;

        if (!uuid) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const data = await guestService.getRandomItem(uuid);

        return res.status(200).json({ success: true, data: data});
    } catch (error) {
        next(error);
    }
}

const LoggingUsage = async (req, res, next) => {
    try {
        const { uuid } = req.body;
        const { toilet_code } = req.params;

        if (!toilet_code) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const newuuid = await guestService.LoggingUsage(toilet_code, uuid);

        return res.status(200).json({ success: true, data: {uuid: newuuid} });
    } catch (error) {
        next(error);
    }
};

const LoggingSurvey = async (req, res, next) => {
    try {
        const { survey, uuid } = req.body;
        const { toilet_code } = req.params;

        if ( !toilet_code || !survey || !uuid ) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const result = await guestService.LoggingSurvey(toilet_code, survey, uuid);

        return res.status(200).json({ success: true, is_valid: result });
    } catch (error) {
        next(error);
    }
};

export { getRandomItem, LoggingUsage, LoggingSurvey };