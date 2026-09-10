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

const login = async (req, res, next) => {
    try {
        const { local_code, password } = req.body;

        if (!local_code || !password) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const result = await userService.login(local_code, password);

        return res.status(200).json({
            success: true,
            data: {
                token: result.token
            }
        })
    } catch (error) {
        next(error);
    }
}

export { getMyProfile, login };