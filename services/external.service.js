export const externalService = {
  execute
}

function execute(task) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve(parseInt(Math.random() * 100))
      } else {
        reject(_getRandomError())
      }
    }, 5000)
  })
}

function _getRandomError() {
  const errors = ['High Temperature', 'Low Battery', 'Network Failure', 'Overload Detected', 'Unexpected Shutdown'];
  return errors[Math.floor(Math.random() * errors.length)];
}