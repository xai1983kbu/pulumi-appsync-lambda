// important !!!
// ctrl + shift + P --> Choose - Save without formatting
// use save without formatting
// https://glebbahmutov.com/blog/configure-prettier-in-vscode/#saving-without-formatting

lambda = require('../../lambdas/Mutation/updatePlace')

exports.requestTemplate = {
  "version": '2017-02-28',
  "operation": 'Invoke',
  "payload": {
    "field": 'updatePlace',
    "arguments": {
      "id": '$context.arguments.findPlaceInput.id',
      "latitude": '$context.arguments.findPlaceInput.latitude',
      "longitude": '$context.arguments.findPlaceInput.longitude',
      "userId": '$context.arguments.findPlaceInput.userId',
      "title": '#if ($context.arguments.updateInput.title)$context.arguments.updateInput.title#else#end',
      "content": '#if ($context.arguments.updateInput.content)$context.arguments.updateInput.content#else#end',
      "imgBucket": '#if ($context.arguments.updateInput.image)$context.arguments.updateInput.image.bucket#else#end',
      "imgRegion": '#if ($context.arguments.updateInput.image)$context.arguments.updateInput.image.region#else#end',
      "imgKey": '#if ($context.arguments.updateInput.image)$context.arguments.updateInput.image.key#else#end',
    },
  }
}

// $utils.toJson($context.result)
exports.responseTemplate = `
$util.toJson($context.result)
`.trim()

exports.lambdaCallbackFunction = undefined
exports.lambdaCallbackFactory = lambda.updatePlaceCallbackFactory
