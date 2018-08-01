/**
 * Bundle up all of the errors here
 */

const { createError } = require('apollo-errors');


/**
 * Default errors to be referenced if necessary in individual files.
 */

module.exports.UnknownError = createError('UnknownError', {
  message: 'An unknown error has occurred! Please try again later'
});

module.exports.DoesNotExistError = createError('DoesNotExistError', {
  message: 'The requested item does not exist!'
})

module.exports.ForbiddenError = createError('ForbiddenError', {
  message: 'You are not allowed to do this!'
});

module.exports.MustBeSignedOutError = createError('MustBeSignedOutError', {
  message: 'You must be logged out to do this!'
});

module.exports.AccessControlViolationError = createError('AccessControlViolationError', {
  message: 'You do not have access to this item!'
});

module.exports.AuthenticationRequiredError = createError('AuthenticationRequiredError', {
  message: 'You must be logged in to do this!'
});

module.exports.InsufficientRoleError = createError('InsufficientRoleError', {
    message: `You do not have the required role to complete this task!`
});

module.exports.DataNotYoursError = createError('DataNotYoursError', {
  message: 'You are not the owner of this data!'
});
