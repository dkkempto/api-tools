/**
 * Reads in 
 */

const { makeExecutableSchema } = require('graphql-tools');
const { parse } = require('api-parser');

const types = ``;

const resolvers = {};

const schema = null;

class Api {
  
  constructor(config) {
    //Load everything in here
    this.config = config;
    this.models = {};
    this.types = '';
    this.resolvers = {};
    this.schema = null;
    this.init();
  }
  
  init() {
    
  }
}


module.exports.Api = Api;