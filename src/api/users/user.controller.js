import * as userService from './user.service.js';

const getMyProfile = async (req, res, next) => {
    try {
        const id = req.user.id; 

        const profile = await userService.getProfile(id);

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

const registerUser = async (req, res, next) => {
    try {
        const {name, email, nickname, password} = req.body;

        if (!name || !email || !nickname || !password) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const result = await userService.register(name, email, nickname, password);

        return res.status(201).json({
            success: true, 
            data: {
                id: result.id,
                nickname: result.nickname
            }
        });
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const result = await userService.login(email, password);

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

export { getMyProfile, registerUser, login };