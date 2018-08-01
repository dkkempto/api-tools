const fs = require('fs');
const auth = require('./auth');
const controllers = require('./controllers');
const { getScalars } = require('./scalars');
const { isVisible } = require('./utils');

/**
 * Autogenerate resolvers frrom the api definition. Bundle together any user defined types. Propably should put in some default scalars as well, like upload and such
 */

const defaultAuth = 'isAuthenticatedResolver';

const getResolvers = (config, api) => {
  if(!api.models) return;
  if(typeof api.models !== 'object') throw new Error("Models must be defined as an object!");


  let res = [];
  
  //Get the scalar resolvers
  let scalars = getScalars(config);

  res.push(scalars);

  let models = Object.values(api.models);

  models.forEach(model => {
    res.push(bundleModelSpecificResolvers(model, config));
  });

  res.push(getCustomResolvers(config));

  return res;
}

const bundleModelSpecificResolvers = (model) => {

  const controller = controllers[model.name];

  if(!controller) throw new Error(`No Controller defined for model ${model.name}`);
  if(!model.read) throw new Error(`No read rights defined for model ${model.name}!`);
  if(!model.create) throw new Error(`No create rights defined for model ${model.name}!`);
  if(!model.update) throw new Error(`No update rights defined for model ${model.name}!`);
  if(!model.delete) throw new Error(`No delete rights defined for model ${model.name}!`);

  return {
    Query: getDefaultQueryResolvers(config, model, controller),
    Mutation: getDefaultMutationResolvers(config, model, controller),
    Subscription: getDefaultSubscriptionResolvers(config, model, controller),
    [model.name]: getDefaultFieldResolvers(config, model, controller)
  }
}

const getDefaultQueryResolvers = (config, model, controller) => {
  if(!isVisible(model.read)) return {};

  return {
    [model.name.ToLowerCase()]: single(config, model, controller),
    [model.plural.ToLowerCase()]: all(config, model, controller)
  }
}

const getDefaultMutationResolvers = (config, model, controller) => {
  if(!isVisible(model.create)) return {};

  return {
    [`create${model.name}`]: create(config, model, controller),
    [`update${model.name}`]: update(config, model, controller),
    [`delete${model.name}`]: remove(config, model, controller)
  }
}

//TODO: Define functionality for subscription resolvers!
const getDefaultSubscriptionResolvers = (config, model, controller) => {
  return {};
}

const getDefaultFieldResolvers = (model) => {
  if(!model.fields) return;
  if(typeof model.fields !== 'object') throw new Error("Fields must be defined as an object!");
  
  let fields = Object.values(model.fields);
  let resolvers = {};
  let rootResolver = auth.isAuthenticatedResolver;
  if(model.auth) {
    if(typeof model.auth !== 'string') throw new Error("The 'auth' parameter must be defined as a string in the api object for autogeneration of a resolver");
    rootResolver = auth[model.auth];
  }

  fields.forEach(field => resolvers.push(getResolverFromField(field, rootResolver)));

  return resolvers;
}

const getResolverFromField = (field, rootResolver) => {
  //TODO: Implement the function for getting the field. Is this where authorization should happen? I think so! So we'll probably need some functions for that here too!
}

const getCustomResolvers = (config) => {
  //TODO: Go through all resolvers defined in files specified in config and return them. We don't put them on the model specific object, but
  //rather in their own object. This way they just get combined by the merge function in graphql-tools!
}

/**
 * 
 * @param {Object} model The model from the api-def
 * @param {Object} controller The controller for the given model.
 * @param {Object} rootResolver The root authentication resolver for the model.
 */
const single = (model, controller, rootResolver) => {
  /**
   * This is the name of the authentication function to be used. Start with the read, if not defined work your way up the chain to model->config.defaults->defaultAuth until
   * you hit one that exists
   */
  const authName = model.read.auth || model.auth || config.defaults.auth || defaultAuth;

  const readAuth = auth[authName];
  
  //TODO: Add some sort of a type-check
  if(!readAuth) throw new Error(`No such authentication function exists '${readAuth}. Make sure that you included the function in the auth.js file!`);

  return readAuth.createResolver((obj, args, context, info) => {
    //TODO: Implement the default read resolver for a generic model. Should use standard controller functions.
  });
}

const all = (config, model, controller) => {

  const authName = model.read.auth || model.auth || config.defaults.auth || defaultAuth;

  const readAuth = auth[authName];

  //TODO: Add some sort of a type-check
  if(!readAuth) throw new Error(`No such authentication function exists '${readAuth}. Make sure that you included the function in the auth.js file!`);

  return readAuth.createResolver((obj, args, context, info) => {
    //TODO: Implement the default read many resolver for a generic model. Should use standard controller functions.
  });
}

const create = (config, model, controller) => {
  const authName = model.create.auth || model.auth || config.defaults.auth || defaultAuth;

  const createAuth = auth[authName];

  //TODO: Add some sort of a type-check
  if(!createAuth) throw new Error(`No such authentication function exists '${createAuth}. Make sure that you included the function in the auth.js file!`);
  
  return createAuth.createResolver((obj, args, context, info) => {
    //TODO: Implement the default remove resolver for a generic model. Should use standard controller functions. Controller function should return a promise that
    //resolves to an object with all of the fields in it. Resolver is not concerned about dataloading. That should be done in the controller.
  });
}

const update = (config, model, controller) => {
  const authName = model.create.auth || model.auth || config.defaults.auth || defaultAuth;

  const updateAuth = auth[authName];

  //TODO: Add some sort of a type-check
  if(!updateAuth) throw new Error(`No such authentication function exists '${updateAuth}. Make sure that you included the function in the auth.js file!`);
  
  return updateAuth.createResolver((obj, args, context, info) => {
    //TODO: Implement the default update resolver for a generic model. Should use standard controller functions.
  });
}

const remove = (config, model, controller) => {
  const authName = model.create.auth || model.auth || config.defaults.auth || defaultAuth;

  const removeAuth = auth[authName];

  //TODO: Add some sort of a type-check
  if(!removeAuth) throw new Error(`No such authentication function exists '${removeAuth}. Make sure that you included the function in the auth.js file!`);
  
  return removeAuth.createResolver((obj, args, context, info) => {
    //TODO: Implement the default remove resolver for a generic model. Should use standard controller functions. Controller function should return a promise that
    //resolves to an object with all of the fields
  });
}

module.exports.getResolvers = getResolvers;