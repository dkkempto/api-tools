/**
 * Reads in 
 */

const { makeExecutableSchema } = require('graphql-tools');
const { parse } = require('api-parser');

const { getTypes } = require('./types');

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
    this.api = {};
    this.init();
  }
  
  init() {
    this.api = parse(`${this.config.root_dir}/api.jaml`);
    this.types = getTypes(this.config, this.api);
  }
}


module.exports.Api = Api;