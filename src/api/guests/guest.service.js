import crypto from 'crypto';
import * as guestRepo from './guest.repository.js';

const LoggingUsage = async (toilet_code, uuid) => {
    let newUuid;
    let is_valid;

    if (!uuid) {
        // 첫 이용이므로 새로운 UUID 생성
        newUuid = crypto.randomUUID();

        is_valid = true;
    }
    else {
        newUuid = uuid;

        is_valid = await guestRepo.IsValidUsage(toilet_code, uuid);
    }

    if (is_valid) {
        await guestRepo.LoggingUsage(toilet_code, newUuid);
    }

    return newUuid;
};

const LoggingSurvey = async (toilet_code, survey, uuid) => {
    const is_valid = await guestRepo.IsValidSurvey(toilet_code, uuid);

    if (!is_valid) return;

    await guestRepo.LoggingSurvey(toilet_code, survey, uuid);
}

export { LoggingUsage, LoggingSurvey };