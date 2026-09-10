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

export { getMyProfile };