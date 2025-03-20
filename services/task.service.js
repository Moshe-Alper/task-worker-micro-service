// task-worker-micro-service/services/task.service.js
import { dbService } from './db.service.js'
import { externalService } from './external.service.js'
import { logger } from './logger.service.js'

const TASK_COLLECTION = 'task';
const MAX_TRIES = 5;

async function getNextTask() {
    try {
        const collection = await dbService.getCollection(TASK_COLLECTION);
        
        // Find tasks with status 'new' or 'failed' but with less than MAX_TRIES
        // Sort by importance (highest first) and tries count (lowest first)
        const task = await collection.findOne(
            { 
                status: { $in: ['new', 'failed'] },
                triesCount: { $lt: MAX_TRIES }
            },
            {
                sort: { importance: -1, triesCount: 1 }
            }
        );
        
        return task;
    } catch (err) {
        logger.error('Error getting next task', err);
        throw err;
    }
}

async function performTask(task) {
    try {
        // Update task status to running
        await updateTask(task._id, { 
            status: 'running',
            lastTriedAt: Date.now(),
            triesCount: task.triesCount + 1
        });
        
        // Execute the task using external service
        const result = await externalService.execute(task);
        
        // Update task for success
        await updateTask(task._id, {
            status: 'done',
            doneAt: Date.now()
        });
        
        return result;
    } catch (error) {
        // Update task for failure
        await updateTask(task._id, { 
            status: 'failed',
            errors: [...(task.errors || []), error.toString()]
        });
        throw error;
    }
}

async function updateTask(taskId, update) {
    try {
        const collection = await dbService.getCollection(TASK_COLLECTION);
        await collection.updateOne(
            { _id: taskId },
            { $set: update }
        );
        
        // Get and return the updated task
        return await getTaskById(taskId);
    } catch (err) {
        logger.error('Error updating task', err);
        throw err;
    }
}

async function getTaskById(taskId) {
    try {
        const collection = await dbService.getCollection(TASK_COLLECTION);
        return await collection.findOne({ _id: taskId });
    } catch (err) {
        logger.error('Error getting task by ID', err);
        throw err;
    }
}

export const taskService = {
    getNextTask,
    performTask,
    updateTask,
    getTaskById
};
