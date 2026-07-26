
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);    
}
module.exports = asyncHandler;//the above code is a higher-order function that wraps asynchronous route handlers and catches any errors that occur within them, passing them to the next middleware (error handler) in the stack.