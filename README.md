# Task Worker Microservice

A robust microservice designed to process tasks from a MongoDB queue, built with Node.js. This worker service is part of the Mister Tasker system, responsible for executing background tasks in a reliable and efficient manner.

The service is supossed to work with the Mister Tasker - Task Management Application:
https://github.com/Moshe-Alper/mister-tasker-frontend-react/tree/main

## Features

- **Priority-based Task Processing**: Tasks are processed based on importance, retry count, and creation time
- **Automatic Retry Mechanism**: Failed tasks are automatically retried up to 5 times
- **Error Handling**: Comprehensive error tracking and logging
- **Graceful Shutdown**: Proper handling of shutdown signals
- **Real-time Logging**: Detailed logging of all worker operations
- **Task Status Management**: Tracks task lifecycle (new → running → done/failed)

## Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB instance
- Environment variables properly configured

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd task-worker-micro-service
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment variables in the config directory

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Task Processing Flow

1. **Task Selection**: 
   - Retrieves tasks with status 'new' or 'failed'
   - Prioritizes by importance (highest first)
   - Considers retry count (lowest first)
   - Respects creation time for fairness

2. **Task Execution**:
   - Updates task status to 'running'
   - Executes the task
   - Updates final status (done/failed)
   - Tracks errors and retry attempts

3. **Error Handling**:
   - Failed tasks are automatically retried
   - Maximum 5 retry attempts
   - Comprehensive error logging

## Task States

- `new`: Initial state of a task
- `running`: Task is currently being processed
- `done`: Task completed successfully
- `failed`: Task failed execution

## Architecture

The service is built with a modular architecture:

- `index.js`: Main worker loop and process management
- `services/`:
  - `task.service.js`: Core task processing logic
  - `db.service.js`: Database operations
  - `external.service.js`: External service execution
  - `logger.service.js`: Logging functionality

## Configuration

The service can be configured through environment variables:

- Database connection settings
- Worker timing parameters
- Logging configurations

## Monitoring

The service provides detailed logs for monitoring:
- Task execution status
- Error tracking
- Performance metrics
- System health information

## Error Handling

The service implements robust error handling:
- Automatic retry mechanism
- Detailed error logging
- Task status tracking
- Error history preservation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Your License Here] 
