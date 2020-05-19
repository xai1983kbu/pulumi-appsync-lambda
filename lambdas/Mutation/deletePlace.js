exports.deletePlaceCallbackFactory = () => {
  const AWS = require('aws-sdk')
  AWS.config.update({ region: 'eu-west-1' })

  const ddb = new AWS.DynamoDB()
  const ddbGeo = require('dynamodb-geo')

  const config = new ddbGeo.GeoDataManagerConfiguration(ddb, 'GeoLandProject')
  config.hashKeyLength = 5

  const myGeoTableManager = new ddbGeo.GeoDataManager(config)

  return async event => {
    console.log('event: ', event)
    const id = event.arguments.id
    const latitude = event.arguments.latitude
    const longitude = event.arguments.longitude

    const userId = event.arguments.userId

    try {
      // throw 'Error with dynamodb'
      const dbResult = await myGeoTableManager
        .deletePoint({
          RangeKeyValue: { S: id },
          GeoPoint: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          DeleteItemInput: {
            ConditionExpression: 'userIdInPool = :userId',
            ExpressionAttributeValues: {
              ':userId': { S: userId }
            }
          }
        })
        .promise()
      return true // item was deleted
    } catch (err) {
      console.error(err)
      if (err.code === 'ConditionalCheckFailedException') {
        // nerver mind. https://stackoverflow.com/a/54265310/9783262
        return true // item doesn't exist
      }
      return false
    }
  }
}
