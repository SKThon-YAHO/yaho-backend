import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepo from './user.repository.js';

const getProfile = async (id) => {
    const result = await userRepo.findById(id);
    return result;
};

const register = async (name, email, nickname, password) => {
    const [emailCheck, nicknameCheck] = await Promise.all([
        userRepo.findByEmail(email),
        userRepo.findByNickname(nickname)
    ]);

    if (emailCheck) {
        const error = new Error('Email is already registered.');
        error.status = 409; 
        error.code = 'DUPLICATED_EMAIL';
        throw error;
    }
    if (nicknameCheck) {
        const error = new Error('Nickname already exists.');
        error.status = 409; 
        error.code = 'DUPLICATED_NICKNAME';
        throw error;
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUserId = await userRepo.insert(name, email, nickname, hashedPassword);

    return {
        id: newUserId,
        nickname: nickname
    };
};

const login = async (email, password) => {
    const user = await userRepo.findByEmail(email);

    if (!user) {
        const error = new Error('Invalid email or password.');
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

    if (user.status !== 'ACTIVE') {
        const error = new Error('Account is not active.');
        error.status = 403;
        error.code = 'ACCOUNT_INACTIVE';
        throw error;
    }

    await userRepo.updateLastLogin(user.id);

    const payload = { id: user.id, nickname: user.nickname };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    return { token };
};

export { getProfile, register, login };