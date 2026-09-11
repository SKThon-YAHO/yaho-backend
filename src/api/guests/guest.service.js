import crypto from 'crypto';
import * as guestRepo from './guest.repository.js';

const getRandomItem = async (uuid) => {
    let selected_item = 'empty';
    let item_number = null;

    const is_valid = await guestRepo.IsValidDraw(uuid);

    if (is_valid) {
        // 아이템별 당첨 확률 가중치 설정 (총합 100 기준)
        const items = [
            { name: 'empty', weight: 50 },
            { name: 'candy', weight: 30 },
            { name: 'tissue', weight: 14 },
            { name: 'stick', weight: 5 },
            { name: 'onnuri', weight: 1 }
        ];

        // 0 이상 100 미만의 난수 생성
        const rand = Math.random() * 100;
        let cumulativeWeight = 0;

        // 가중치 누적 합산을 통한 아이템 추첨
        for (const item of items) {
            cumulativeWeight += item.weight;
            if (rand <= cumulativeWeight) {
                selected_item = item.name;
                break;
            }
        }

        // 당첨 항목이 empty가 아닐 때만 16자리 난수 번호 발급
        if (selected_item !== 'empty') {
            item_number = '';
            for (let i = 0; i < 16; i++) {
                item_number += Math.floor(Math.random() * 10);
            }
        }
        
        await guestRepo.LoggingDrow(item, item_number, uuid);
    }

    return { 
        item: selected_item, 
        item_number 
    };
};

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
    const is_valid_s = await guestRepo.IsValidSurvey(toilet_code, uuid);
    const is_valid_d = await guestRepo.IsValidDraw(uuid);
    // 만약 설문이 발리드 하지 않다면, 설문은 뛰어넘고 경품 발리드 검사
    // 설문이 발리드 하다면, 설문을 하고 경품 발리드 검사
    if (is_valid_s) {
        await guestRepo.LoggingSurvey(toilet_code, survey, uuid);
    }

    return is_valid_d;
}

export { LoggingUsage, LoggingSurvey, getRandomItem };