// important !!!
// ctrl + shift + P --> Choose - Save without formatting
// use save without formatting
// https://glebbahmutov.com/blog/configure-prettier-in-vscode/#saving-without-formatting

lambda = require('../../lambdas/Query/queryRadius')

exports.requestTemplate = {
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "field": "queryRadius",
    "arguments": { 
      radius: "$context.arguments.radius",  
      centerPoint: { 
        "latitude": "$context.arguments.centerPoint.latitude",
        "longitude": "$context.arguments.centerPoint.longitude" }}
  }
}

// $utils.toJson($context.result)
exports.responseTemplate = `
$utils.toJson($context.result)
`.trim()

exports.lambdaCallbackFunction = undefined
exports.lambdaCallbackFactory = lambda.queryRadiusCallbackFactory

