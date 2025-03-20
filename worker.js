// task-worker-micro-service/worker.js
import { dbService } from './services/db.service.js'
import { taskService } from './services/task.service.js'
import { logger } from './services/logger.service.js'
import './config/index.js'

// Global flag to control worker operation
let isWorkerOn = true;

// Main worker function that processes tasks
async function runWorker() {
    // Check if worker should be running
    if (!isWorkerOn) return;
    
    var delay = 5000;
    try {
        const task = await taskService.getNextTask();
        if (task) {
            try {
                logger.info(`Processing task: ${task._id} - ${task.title}`);
                await taskService.performTask(task);
                logger.info(`Successfully completed task: ${task._id}`);
            } catch (err) {
                logger.error(`Failed Task ${task._id}:`, err);
            } finally {
                delay = 1; // Immediately check for the next task
            }
        } else {
            logger.info('Snoozing... no tasks to perform');
        }
    } catch(err) {
        logger.error(`Failed getting next task to execute`, err);
    } finally {
        setTimeout(runWorker, delay);
    }
}

// Start the worker
logger.info('Task Worker Micro-Service starting...');

// Setup the database indexes first
dbService.setupIndexes()
    .then(() => {
        logger.info('Database indexes setup completed');
        // Start the worker after indexes are set up
        runWorker();
    })
    .catch(err => {
        logger.error('Failed to setup database indexes:', err);
        process.exit(1);
    });

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down task worker...');
    isWorkerOn = false;
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});
