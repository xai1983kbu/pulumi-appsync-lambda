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
      "userId": '#if ($context.arguments.place.userId)$context.arguments.place.userId#else#end',
      "title": '#if ($context.arguments.place.title)$context.arguments.place.title#else#end',
      "content": '#if ($context.arguments.place.content)$context.arguments.place.content#else#end',
      "imgBucket": '#if ($context.arguments.place.image)$context.arguments.place.image.bucket#else#end',
      "imgRegion": '#if ($context.arguments.place.image)$context.arguments.place.image.region#else#end',
      "imgKey": '#if ($context.arguments.place.image)$context.arguments.place.image.key#else#end',
    },
  }
}

// $utils.toJson($context.result)
exports.responseTemplate = `
$util.toJson($context.result)
`.trim()

exports.lambdaCallbackFunction = undefined
exports.lambdaCallbackFactory = lambda.addPlaceCallbackFactory
