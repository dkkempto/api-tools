const { Api } = require('./index');

let api = new Api({
  root_dir: "C:\\Users\\dkkem\\test\\wesignapi\\graphql",
  defaults: {}
})

console.log(api.types);