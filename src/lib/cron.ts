import cron from 'node-cron';
import { syncChaptersAndDistricts, syncMembers, syncFinancialMembers } from './actions/sync';

export function startCronJobs() {
    console.log('Initializing Cron Jobs...');

    // Schedule task to run every day at midnight (00:00)
    // pattern: minute hour day-of-month month day-of-week
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily sync job:', new Date().toISOString());
        try {
            console.log('Syncing Chapters and Districts...');
            await syncChaptersAndDistricts();

            console.log('Syncing Members...');
            await syncMembers();

            console.log('Syncing Financial Members...');
            await syncFinancialMembers();

            console.log('Daily sync job completed successfully:', new Date().toISOString());
        } catch (error) {
            console.error('Error running daily sync job:', error);
        }
    });
}
