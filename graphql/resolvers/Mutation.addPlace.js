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
      "title": '$context.arguments.place.title',
      "content": '$context.arguments.place.content',
      "imgBucket": '$context.arguments.place.image.bucket',
      "imgRegion": '$context.arguments.place.image.region',
      "imgKey": '$context.arguments.place.image.key',
      "userId": '$context.arguments.place.userId'
    },
  }
}

// $utils.toJson($context.result)
exports.responseTemplate = `
$util.toJson($context.result)
`.trim()

exports.lambdaCallbackFunction = undefined
exports.lambdaCallbackFactory = lambda.addPlaceCallbackFactory
