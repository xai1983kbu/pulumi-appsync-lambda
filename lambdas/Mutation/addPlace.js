exports.addPlaceCallbackFactory = () => {
  const { v4: uuidv4 } = require('uuid')

  const AWS = require('aws-sdk')
  AWS.config.update({ region: 'eu-west-1' })

  const ddb = new AWS.DynamoDB()
  const ddbGeo = require('dynamodb-geo')

  const config = new ddbGeo.GeoDataManagerConfiguration(ddb, 'GeoLandProject')
  config.hashKeyLength = 5

  const myGeoTableManager = new ddbGeo.GeoDataManager(config)

  return async event => {
    console.log('event: ', event)
    const latitude = event.arguments.latitude
    const longitude = event.arguments.longitude
    const title = event.arguments.title
    const content = event.arguments.content
    const imgBucket = event.arguments.imgBucket
    const imgRegion = event.arguments.imgRegion
    const imgKey = event.arguments.imgKey

    const userId = event.arguments.userId

    const jsonPlaceInfo = JSON.stringify({
      latitude,
      longitude,
      title,
      content,
      userId,
      images: [
        {
          bucket: imgBucket,
          region: imgRegion,
          key: imgKey
        }
      ]
    })

    try {
      // throw 'Error with dynamodb'
      if (content.title > 250)
        throw 'Length of Title is more than 250 characters'

      if (content.length > 2500)
        throw 'Length of Content is more than 2500 characters'

      const dbResult = await myGeoTableManager
        .putPoint({
          RangeKeyValue: { S: uuidv4() }, // Use this to ensure uniqueness of the hash/range pairs.
          GeoPoint: {
            // An object specifying latitutde and longitude as plain numbers. Used to build the geohash, the hashkey and geojson data
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          PutItemInput: {
            // Passed through to the underlying DynamoDB.putItem request. TableName is filled in for you.
            Item: {
              jsonPlaceInfo: { S: jsonPlaceInfo || 'empty' },
              userIdInPool: { S: userId || 'empty' }
            }
            // ... Anything else to pass through to `putItem`, eg ConditionExpression
          }
        })
        .promise()

      return {
        latitude,
        longitude,
        title,
        content,
        image: {
          bucket: imgBucket,
          region: imgRegion,
          key: imgKey
        },
        userId
      }
    } catch (err) {
      // console.error(err)
      return { error: err }
    }
  }
}
