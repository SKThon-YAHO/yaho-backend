import * as manageRepo from './manage.repository.js';

const addCleaningLog = async ({ local_code, toilet_code, cleaning_type }) => {
    await manageRepo.addCleaningLog(local_code, toilet_code, cleaning_type);
};

export { addCleaningLog };