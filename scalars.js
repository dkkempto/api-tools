/**
 * Set default scalars.
 * Bundle together with scalars defined by user
 */
const { GraphQLScalarType } = require('graphql');
const { isISO8601 } = require('validator');

const parseISO6801 = (value) => {
  if(isISO8601(value)) {
    return value;
  }
  throw new Error('DateTime cannot represent an invalid ISO-6801 Date string');
}

const serializeISO6801 = (value) => {
  if(isISO8601(value)) {
    return value;
  }
  throw new Error('DateTime cannot represent an invalid ISO-6801 Date string')
}

const parseLiteralISO6801 = (ast) => {
  if(isISO8601(ast.value)) {
    return ast.value;
  }
  throw new Error('DateTime cannot represent an invalid ISO-6801 Date string')
}

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'An ISO-8601 encoded UTC date string',
  serialize: serializeISO6801,
  parseValue: parseISO6801,
  parseLiteral: parseLiteralISO6801
})

const defaults = {
  DateTime
}

/**
 * //TODO
 * Reads through config-specified directory and bundles scalars defined by the user
 * @param {Object} config Configuration file for the api
 */
const getUserDefinedScalars = (config) => {
  //Check to see if a path is defined, otherwise use the default
  
  //Import required scalars 

  return {};
}

/**
 * //TODO Check to make sure there aren't any conflicts between defaults and userDefined. userDefined should hopefully just trump them
 * Bundles the scalars together and returns one object containing all of them
 * @param {Object} config Configuration file for the api
 */
const getScalars = (config) => {
  const userDefined = getUserDefinedScalars(config);
  return {
    ...defaults,
    ...userDefined
  }
}

module.exports.getScalars = getScalars;
