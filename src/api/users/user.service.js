import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepo from './user.repository.js';

const getProfile = async (local_code) => {
    const result = await userRepo.findById(local_code);
    
    const data = {local_code: result.local_code, num_toilet: result.num_toilet, role: result.role};

    return data;
};

local_code, name, num_toilet, password, role

const login = async (local_code, password) => {
    const user = await userRepo.findByLocalCode(local_code);

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

export { getProfile, login };