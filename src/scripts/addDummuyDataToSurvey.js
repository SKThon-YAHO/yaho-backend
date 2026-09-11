import crypto from 'crypto';
import pool from '../config/database.js';

// 확률에 따라 true 혹은 false 반환
const getRandomBool = (probability) => Math.random() < probability;

// survey JSON 객체 생성
const generateSurvey = (prob) => ({
    clean: {
        toilet: getRandomBool(prob),
        urinal: getRandomBool(prob),
        sink: getRandomBool(prob),
        floor: getRandomBool(prob)
    },
    break: {
        toilet: getRandomBool(prob),
        urinal: getRandomBool(prob),
        sink: getRandomBool(prob),
        door: getRandomBool(prob)
    },
    item: {
        soap: getRandomBool(prob),
        paper: getRandomBool(prob),
        trash: getRandomBool(prob)
    }
});

const seedLogs = async () => {
    // 100개 이상의 true 응답을 쌓을 집중 타겟 화장실 3곳
    const targetCodes = ['202654699559999991', '202654699559999992', '202654699559999993'];
    
    // 나머지 화장실
    const otherCodes = [
        '202654699559999994', '202654699559999995', '202654699559999996',
        '202654699559999997', '202654699559999998', '202654699559999999'
    ];

    const surveyLogs = [];
    const usageLogs = [];

    // 타겟 화장실 3곳: 각각 200개의 로그 생성 (true 확률 60%)
    for (const code of targetCodes) {
        for (let i = 0; i < 200; i++) {
            const uuid = crypto.randomUUID();
            surveyLogs.push({ code, survey: generateSurvey(0.6), uuid });
            usageLogs.push({ code, uuid });
        }
    }

    // 나머지 화장실: 400개의 로그를 무작위로 배분 (true 확률 20%)
    for (let i = 0; i < 400; i++) {
        const code = otherCodes[Math.floor(Math.random() * otherCodes.length)];
        const uuid = crypto.randomUUID();
        surveyLogs.push({ code, survey: generateSurvey(0.2), uuid });
        usageLogs.push({ code, uuid });
    }

    // pool.connect()를 통해 트랜잭션을 위한 단일 클라이언트 획득
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // usage_log 삽입
        for (const log of usageLogs) {
            await client.query(
                `INSERT INTO toilet_usage_log (toilet_code, uuid) VALUES ($1, $2)`,
                [log.code, log.uuid]
            );
        }

        // survey_log 삽입
        for (const log of surveyLogs) {
            await client.query(
                `INSERT INTO toilet_survey_log (toilet_code, survey, uuid) VALUES ($1, $2::jsonb, $3)`,
                [log.code, JSON.stringify(log.survey), log.uuid]
            );
        }

        await client.query('COMMIT');
        console.log('1000개의 더미데이터 삽입이 완료되었습니다.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('데이터 삽입 중 오류 발생:', error);
    } finally {
        client.release();
        // 스크립트 실행 완료 후 프로세스 종료
        process.exit(0); 
    }
};

seedLogs();