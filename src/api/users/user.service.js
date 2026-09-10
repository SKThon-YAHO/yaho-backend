import * as userRepo from './user.repository.js';

const getProfile = async (local_code) => {
    const result = await userRepo.findByLocalCode(local_code);

    if (!result) {
        const error = new Error('존재하지 않는 지자체 코드입니다.');
        error.status = 404;
        error.code = 'LOCAL_CODE_NOT_FOUND'
        throw error;
    }

    return { local_code: result.local_code, num_toilet: result.num_toilet, role: result.role };
};

const getDashboard = async (local_code) => {
    const stats = await userRepo.getDashboardStats(local_code);

    // 각 화장실에 청소 필요 여부 배지 붙이기
    return stats.map((row) => ({
        ...row,
        needsCleaning: row.dirty_count > 0 || row.supply_count > 0,
    }));
};

const getMyToilets = async (local_code) => {
    return userRepo.getMyToilets(local_code);
};

const getUsage = async (local_code, period) => {
    return userRepo.getUsage(local_code, period);
};

export { getProfile, getDashboard, getMyToilets, getUsage };