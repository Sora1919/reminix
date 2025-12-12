// lib/cron.ts
import cron from 'node-cron';
import { checkAndCreateNotifications } from './notification-service';

// Run every minute
cron.schedule('* * * * *', async () => {
    console.log('Running notification check...');
    try {
        await checkAndCreateNotifications();
    } catch (error) {
        console.error('Cron job failed:', error);
    }
});