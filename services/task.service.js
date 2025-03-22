// task-worker-micro-service/services/task.service.js
import { dbService } from './db.service.js'
import { externalService } from './external.service.js'
import { logger } from './logger.service.js'

export const taskService = {
    getNextTask,
    performTask,
    updateTask,
    getTaskById
}

const MAX_TRIES = 5

async function getNextTask() {
    try {
        const collection = await dbService.getCollection('task')
        
        // Sort by 
        const task = await collection.findOne(
            { 
                status: { $in: ['new', 'failed'] },
                triesCount: { $lt: MAX_TRIES }  // 
            },
            {
                sort: { importance: -1, triesCount: 1, createdAt: 1 }//importance (highest first), tries count (lowest first) and created for fairness
            }
        )
        
        return task
    } catch (err) {
        logger.error('Error getting next task', err)
        throw err
    }
}

async function performTask(task) {
    try {
        await updateTask(task._id, { 
            status: 'running',
            lastTriedAt: Date.now(),
            triesCount: task.triesCount + 1
        })
        
        const result = await externalService.execute(task)
        
        await updateTask(task._id, {
            status: 'done',
            doneAt: Date.now()
        })
        
        return result
    } catch (error) {
        
        await updateTask(task._id, { 
            status: 'failed',
            errors: [...(task.errors || []), error.toString()]
        })
        throw error
    }
}

async function updateTask(taskId, update) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.updateOne(
            { _id: taskId },
            { $set: update }
        )
        
        return await getTaskById(taskId)
    } catch (err) {
        logger.error('Error updating task', err)
        throw err
    }
}

async function getTaskById(taskId) {
    try {
        const collection = await dbService.getCollection('task')
        return await collection.findOne({ _id: taskId })
    } catch (err) {
        logger.error('Error getting task by ID', err)
        throw err
    }
}

