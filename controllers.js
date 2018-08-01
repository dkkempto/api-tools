let controllers = null;

/**
 * Controllers should be model agnostic. Controller should have a common interface, such as getOne(model, field?)
 */

const getControllers = (config, api) => {
    return {
        User: createController(),
        Signing: createController(),
        Address: createController()
    }
}

/**
 * 
 * @param {Object} connector The connector that this object should use
 */
const createController = (connector) => {
    return class {
        constructor(obj, args, context, info) {
            this.obj = obj;
            this.args = args;
            this.context = context;
            this.info = info;
        }
    }
}

module.exports.getControllers = (config, api) => {
    if(!controllers) {
        controllers = getControllers(config, api);
    }
    return controllers;
}
