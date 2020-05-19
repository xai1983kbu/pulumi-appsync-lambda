// important !!!
// ctrl + shift + P --> Choose - Save without formatting
// use save without formatting
// https://glebbahmutov.com/blog/configure-prettier-in-vscode/#saving-without-formatting

lambda = require('../../lambdas/Mutation/deletePlace')

exports.requestTemplate = {
  "version": '2017-02-28',
  "operation": 'Invoke',
  "payload": {
    "field": 'deletePlace',
    "arguments": {
      "id": '$context.arguments.findPlaceInput.id',
      "latitude": '$context.arguments.findPlaceInput.latitude',
      "longitude": '$context.arguments.findPlaceInput.longitude',
      "userId": '$context.arguments.findPlaceInput.userId'
    },
  }
}

// $utils.toJson($context.result)
exports.responseTemplate = `
$util.toJson($context.result)
`.trim()

exports.lambdaCallbackFunction = undefined
exports.lambdaCallbackFactory = lambda.deletePlaceCallbackFactory
