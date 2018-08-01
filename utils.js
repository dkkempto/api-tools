/**
 * WORK IN PROGRESS: DOESN'T FUNCTION THE WAY IT SHOULD RIGHT NOW
 * Takes a template literal and normalizes the indentation according to the given line number.
 * Defaults to line 0
 * @param {String} text The template literal to be dedented
 * @param {Int} line The line number to base indents off of
 */
const dedent = (lines) => {
  console.log(lines);
  if(typeof lines === 'string') lines = lines.split('\n');

  lines = lines.filter(line => line.trim() !== '');
  
  if(lines.length == 0) return '';

  const matches = lines[0].match(/^(\s+)/);

  const indent = matches ? matches[0] : '';

  console.log('before', lines);
  
  lines = lines.map(line => line.replace(indent, ''));
  
  console.log('after', lines);
  return lines.join('\n');
}


const isVisible = (obj) => {
  return (
    obj.public ||
    obj.private ||
    obj.protected ||
    obj.internal ||
    obj.included ||
    obj.required
  );
}

//TODO: Maybe throw an error if there are multiple access modifiers set? Doesn't really seem to make a whole lot of sense to have multiple. They don't really coalesce
const getAccessModifier = (obj, defaultModifier = 'public') => {
  let modifier = defaultModifier;

  //Lowest precedence
  if(obj.public) modifier = ACCESS_MODIFIERS.PUBLIC;
  
  //These, I'm not really sure. Honestly you really shouldn't be setting multiple access modifiers, this is just being safe.
  if(obj.private) modifier = ACCESS_MODIFIERS.PUBLIC;
  if(obj.protected) modifier = ACCESS_MODIFIERS.PUBLIC;
  if(obj.internal) modifier = ACCESS_MODIFIERS.PUBLIC;

  //Highest precedence. If set as hidden, it should be hidden
  if(obj.hidden) modifier = ACCESS_MODIFIERS.PUBLIC;

  return modifier;
}

const ACCESS_MODIFIERS = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PROTECTED: 'protected',
  INTERNAL: 'internal',
  HIDDEN: 'hidden'
}

const DEFAULT_PATH = '../../graphql';

module.exports = {
  dedent,
  isVisible,
  ACCESS_MODIFIERS,
  DEFAULT_PATH,
  getAccessModifier
}