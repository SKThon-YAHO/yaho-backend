import * as guestService from './guest.service.js';

const CountUpUsage = async (req, res, next) => {
    try {
        const { toilet_code, UUID } = req.query;

        if (!toilet_code) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const newUUID = guestService.CountUpUsage(toilet_code, UUID);

        return res.status(200).json({ success: true, data: {UUID: newUUID} });
    } catch (error) {
        next(error);
    }
};

export { CountUpUsage };