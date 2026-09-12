import crypto from 'crypto';
import pool from '../config/database.js';

const getRandomBool = (probability) => Math.random() < probability;

const generateSurvey = (baseProb) => {
    const probClean = Math.min(baseProb * 1.5, 0.9);
    const probBreak = baseProb * 0.2; 
    const probItem = Math.min(baseProb * 1.2, 0.9);

    return {
        clean: {
            toilet: getRandomBool(probClean),
            urinal: getRandomBool(probClean * 0.8),
            sink: getRandomBool(probClean * 0.5),
            floor: getRandomBool(probClean * 1.2) 
        },
        break: {
            toilet: getRandomBool(probBreak),
            urinal: getRandomBool(probBreak),
            sink: getRandomBool(probBreak * 0.5),
            door: getRandomBool(probBreak * 1.5) 
        },
        item: {
            soap: getRandomBool(probItem),
            paper: getRandomBool(probItem * 1.5), 
            trash: getRandomBool(probItem * 0.8)
        }
    };
};

// 2026년 1월 1일부터 현재까지 무작위 타임스탬프 생성 함수
const getRandomTimestamp = () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    const end = new Date().getTime();
    return new Date(start + Math.random() * (end - start));
};

const seedLogs = async () => {
    const targetCodes = ['202654699559999991', '202654699559999992', '202654699559999993'];
    const lowTrafficCodes = ['202654699559999998', '202654699559999999'];
    const normalCodes = [
        '202654699559999994', '202654699559999995', 
        '202654699559999996', '202654699559999997'
    ];

    const surveyLogs = [];
    const usageLogs = [];

    for (const code of targetCodes) {
        for (let i = 0; i < 200; i++) {
            const uuid = crypto.randomUUID();
            const createdAt = getRandomTimestamp();
            surveyLogs.push({ code, survey: generateSurvey(0.5), uuid, createdAt });
            usageLogs.push({ code, uuid, createdAt });
        }
    }

    for (const code of lowTrafficCodes) {
        for (let i = 0; i < 30; i++) {
            const uuid = crypto.randomUUID();
            const createdAt = getRandomTimestamp();
            surveyLogs.push({ code, survey: generateSurvey(0.1), uuid, createdAt });
            usageLogs.push({ code, uuid, createdAt });
        }
    }

    for (let i = 0; i < 340; i++) {
        const code = normalCodes[Math.floor(Math.random() * normalCodes.length)];
        const uuid = crypto.randomUUID();
        const createdAt = getRandomTimestamp();
        surveyLogs.push({ code, survey: generateSurvey(0.2), uuid, createdAt });
        usageLogs.push({ code, uuid, createdAt });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        for (const log of usageLogs) {
            await client.query(
                `INSERT INTO toilet_usage_log (toilet_code, uuid, created_at) VALUES ($1, $2, $3)`,
                [log.code, log.uuid, log.createdAt]
            );
        }

        for (const log of surveyLogs) {
            await client.query(
                `INSERT INTO toilet_survey_log (toilet_code, survey, uuid, created_at) VALUES ($1, $2::jsonb, $3, $4)`,
                [log.code, JSON.stringify(log.survey), log.uuid, log.createdAt]
            );
        }

        await client.query('COMMIT');
        console.log('1000개의 더미데이터 삽입이 완료되었습니다.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('데이터 삽입 중 오류 발생:', error);
    } finally {
        client.release();
        process.exit(0); 
    }
};

seedLogs();