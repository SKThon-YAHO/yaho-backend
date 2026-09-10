import crypto from 'crypto';
import * as guestRepo from './guest.repository.js';

const CountUpUsage = async (toilet_code, UUID) => {
    let newUUID;
    let is_valid;

    if (!UUID) {
        // 첫 이용이므로 새로운 UUID 생성
        newUUID = crypto.randomUUID();

        is_valid = true;
    }
    else {
        newUUID = UUID;

        is_valid = await guestRepo.IsValid(toilet_code, UUID);
    }

    if (is_valid) {
        await guestRepo.CountUpUsage(toilet_code);
    }

    return newUUID;
};

export { CountUpUsage };