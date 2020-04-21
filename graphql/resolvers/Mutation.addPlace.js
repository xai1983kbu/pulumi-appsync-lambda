// important !!!
// ctrl + shift + P --> Choose - Save without formatting
// use save without formatting
// https://glebbahmutov.com/blog/configure-prettier-in-vscode/#saving-without-formatting

lambda = require('../../lambdas/Mutation/addPlace')

exports.requestTemplate = {
  "version": '2017-02-28',
  "operation": 'Invoke',
  "payload": {
    "field": 'addPlace',
    "arguments": {
      "latitude": '$context.arguments.place.latitude',
      "longitude": '$context.arguments.place.longitude',
      "name": '$context.arguments.place.name',
      "address": '$context.arguments.place.address',
      "phone": '$context.arguments.place.phone'
    }
  }
}

// $utils.toJson($context.result)
exports.responseTemplate = `
$utils.toJson($context.result)
`.trim()

exports.lambdaCallbackFunction = undefined
exports.lambdaCallbackFactory = lambda.addPlaceCallbackFactory
