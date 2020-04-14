lambda = require('../../lambdas/singlePost')

// use save without formatting
// https://glebbahmutov.com/blog/configure-prettier-in-vscode/#saving-without-formatting
exports.requestTemplate = {
  version: '2017-02-28',
  operation: 'Invoke',
  payload: {
    field: 'singlePost',
    arguments: { id: '$context.arguments.id' }
  }
}

exports.responseTemplate = `
$utils.toJson($context.result)
`.trim()

console.log(lambda.singlePost)

exports.lambdaFunction = lambda.singlePost
