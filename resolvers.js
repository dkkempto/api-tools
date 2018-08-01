const fs = require('fs');
const auth = require('./auth');
const { getControllers } = require('./controllers');
const errors = require('./errors');
const { getScalars } = require('./scalars');
const { isVisible, getAccessModifier, ACCESS_MODIFIERS, DEFAULT_PATH } = require('./utils');


/**
 * Autogenerate resolvers from the api definition. Bundle together any user defined types. Propably should put in some default scalars as well, like upload and such
 */

const defaultAuth = 'isAuthenticatedResolver';

const getResolvers = (config, api) => {
  if(!api.models) return;
  if(typeof api.models !== 'object') throw new Error("Models must be defined as an object!");


  let res = [];

  let scalars = getScalars(config);

  res.push(scalars);

  let models = Object.values(api.models);

  models.forEach(model => {
    res.push(bundleModelSpecificResolvers(config, api, model));
  });

  res.push(getCustomResolvers(config));

  return res;
}

const bundleModelSpecificResolvers = (config, api, model) => {

  const controller = getControllers(config, api)[model.name];

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
    [model.name.toLowerCase()]: single(config, model, controller),
    [model.plural.toLowerCase()]: all(config, model, controller)
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

const getDefaultFieldResolvers = (config, model, controller) => {
  if(!model.fields) return;
  if(typeof model.fields !== 'object') throw new Error("Fields must be defined as an object!");
  let fields = Object.values(model.fields);
  let resolvers = {};
  
  fields.forEach(field => {
    const fieldResolver = getResolverFromField(config, field, model);
    if(fieldResolver) resolvers[field.name] = fieldResolver;
  });
  return resolvers;
}

const getResolverFromField = (config, field, model) => {
  //TODO: Implement the function for getting the field. Is this where authorization should happen? I think so! So we'll probably need some functions for that here too!
  const authName = field.read.auth || field.auth || model.auth || config.defaults.auth || defaultAuth;

  const readAuth = auth[authName];

  if(!readAuth) throw new Error(`No such authentication function exists '${readAuth}'. Make sure that you included the function in the auth.js file!`);
  
  if(isVisible(field.read)) {
    //If the field is visible, we need to switch on it's access type and act accordingly
    let accessModifier = getAccessModifier(field.read);
    switch(accessModifier) {
      case ACCESS_MODIFIERS.PUBLIC: {
        return readAuth.createResolver((obj, args, context, info) => {
          return obj[field.name];
        });
      }
      case ACCESS_MODIFIERS.PROTECTED: {
        return readAuth.createResolver((obj, args, context, info) => {
          if(hasRole(context, field)) return obj[field.name];
          if(isOwner(context, field, obj)) return obj[field.name];
          throw new errors.AccessControlViolationError();
        });
      }
      case ACCESS_MODIFIERS.INTERNAL: {
        return readAuth.createResolver((obj, args, context, info) => {
          if(hasRole(context, field)) return obj[field.name];
          throw new errors.AccessControlViolationError();
        });
      }
      case ACCESS_MODIFIERS.PRIVATE: {
        return readAuth.createResolver((obj, args, context, info) => {
          if(isOwner(context, field, obj)) return obj[field.name];
        });
      }
    }
  }

  return null;

}

const ROLE_WILDCARD = '*';

const hasRole = (context, field) => {
  //TODO: Establish standards for the user object in context. When we have a standard, this will need to be updated
  const role = context.user.role;
  const roles = field.roles;
  
  if(!role) return false;
  if(!field.roles) return false;
  if(typeof roles === 'string') return role === roles;
  if(typeof roles === 'object') {
    if(Object.values(field.roles).includes(role)) return true;
    if(Object.values(field.roles).includes(ROLE_WILDCARD)) return true;
    //TODO: Are there any other roles that would allow us to return true?
  }

  return false;
}

//TODO: As soon as a format for context is decided upon, update this method!
const isOwner = (context, field, obj) => {
  const ownershipKeys = field.ownershipKeys;
  const id = context.user.id;

  if(!ownershipKeys) return false;
  if(typeof ownershipKeys === 'string') return obj[ownershipKeys] === id;
  if(typeof ownershipKeys === 'object') return Object.values(ownershipKeys).some(ownershipKey => obj[ownershipKey] === id);

  //TODO: Are there any other circumstances where a user might be considered an owner/granted special priveleges?
  
  return false;
}

const getCustomResolvers = (config) => {
  //TODO: Go through all resolvers defined in files specified in config and return them. We don't put them on the model specific object, but
  //rather in their own object. This way they just get combined by the merge function in graphql-tools!

  let res = [];

  const dir = config.root_dir || DEFAULT_PATH;

  fs.readdirSync(dir)
  .filter(file => {
    return fs.statSync(`${dir}/${file}`).isDirectory();
  }).forEach(model => {
    fs.readdirSync(`${dir}/${model}`)
      .filter(file => {
        return (
          file.indexOf('.') !== 0 &&
          (
            file.toLowerCase().includes('resolver')
          )
        )
      })
      .forEach(file => {
        const resolvers = require(`${dir}/${model}/${file}`);
        res.push(resolvers);
      });
  });

  return res;
}

/**
 * 
 * @param {Object} model The model from the api-def
 * @param {Object} controller The controller for the given model.
 * @param {Object} rootResolver The root authentication resolver for the model.
 */
const single = (config, model, controller) => {
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