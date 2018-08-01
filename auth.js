const { createResolver } = require('apollo-resolvers');
const { isInstance } = require('apollo-errors');
const errors = require('./errors');

/**
 * Base auth resolver.
 */
const baseResolver = createResolver(
  null,
  (root, args, context, error) => isInstance(error) ? error: new errors.UnknownError({message: error.message})
);

/**
 * Requires a user to be authenticated before resolving.
 */
const isAuthenticatedResolver = baseResolver.createResolver((obj, args, context, info) => {
  //TODO: Do some fancier auth here
  if(!user) throw new errors.AuthenticationRequiredError();
});

/**
 * Requires no user authentication data before resolving.
 */
const isNotAuthenticatedResolver = baseResolver.createResolver((obj, args, context, info) => {
  //TODO: Do some fancier auth here
  if(user) throw new errors.MustBeSignedOutError();
})

//Default auth resolvers. Visible for all to use in subsequent resolvers

module.exports.isAuthenticatedResolver = isAuthenticatedResolver;
module.exports.isNotAuthenticatedResolver = isNotAuthenticatedResolver;

/**
 * //TODO: Make a decision on this
 * An object containing all of the auth resolvers, should really only be referenced internally. Not really sure on this one actually. Do we need to bundle everything up?
 * I'm gonna go with no for now. It just is too much to think about at the moment and I want to get moving on other stuff. It seems to me that if the end-user is going to create
 * new resolvers, those are application specific and can just be held inside of the auth.js file inside of the application itself and be referenced as needed. 
 */
module.exports.auth = {

}