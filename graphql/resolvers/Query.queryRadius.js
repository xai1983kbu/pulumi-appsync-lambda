// important !!!
// ctrl + shift + P --> Choose - Save without formatting
// use save without formatting
// https://glebbahmutov.com/blog/configure-prettier-in-vscode/#saving-without-formatting

lambda = require('../../lambdas/Query/queryRadius')

exports.requestTemplate = {
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "field": "singlePost",
    // "arguments": { id: "$context.arguments.id" }
  }
}

// $utils.toJson($context.result)
exports.responseTemplate = `
$context.result
`.trim()

exports.lambdaCallbackFunction = undefined
exports.lambdaCallbackFactory = lambda.queryRadiusCallbackFactory

