import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authRepo from './auth.repository.js';

const login = async (local_code, password) => {
    const user = await authRepo.findByLocalCode(local_code);

    if (!user) {
        const error = new Error('Invalid local_code or password.');
        error.status = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
    }

    if (user.deleted_at !== NULL) {
        const error = new Error('Account is deleted.');
        error.status = 403;
        error.code = 'ACCOUNT_DELETED';
        throw error;
    }

    const payload = { local_code: user.local_code, name: user.name };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    return { token };
};

export { login };