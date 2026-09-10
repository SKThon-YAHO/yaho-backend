import * as authService from './auth.service.js';

const login = async (req, res, next) => {
    try {
        const { local_code, password } = req.body;

        if (!local_code || !password) {
            const error = new Error('Missing required fields.');
            error.status = 400;
            error.code = 'MISSING_REQUIRED_FIELDS';
            throw error;
        }

        const result = await authService.login(local_code, password);

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

export { login };