import * as userRepo from './user.repository.js';

const getProfile = async (local_code) => {
    const result = await userRepo.findById(local_code);
    
    const data = {local_code: result.local_code, num_toilet: result.num_toilet, role: result.role};

    return data;
};

export { getProfile };