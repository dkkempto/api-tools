/**
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

module.exports = {
  dedent
}