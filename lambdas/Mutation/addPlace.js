exports.addPlaceCallbackFactory = () => {
  const { v4: uuidv4 } = require('uuid')

  const AWS = require('aws-sdk')
  AWS.config.update({ region: 'eu-west-1' })

  const ddb = new AWS.DynamoDB()
  const ddbGeo = require('dynamodb-geo')

  const config = new ddbGeo.GeoDataManagerConfiguration(
    ddb,
    'ask-where-to-find-place'
  )
  config.hashKeyLength = 5

  const myGeoTableManager = new ddbGeo.GeoDataManager(config)

  return async event => {
    const latitude = event.arguments.latitude
    const longitude = event.arguments.longitude
    const address = event.arguments.address
    const name = event.arguments.name
    let phone = event.arguments.phone

    try {
      // throw 'Error with dynamodb'

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
              name: { S: name || 'empty' },
              address: { S: address || 'empty' },
              phone: { S: phone || 'empty' }
            }
            // ... Anything else to pass through to `putItem`, eg ConditionExpression
          }
        })
        .promise()

      return {
        latitude,
        longitude,
        address,
        name,
        phone
      }
    } catch (err) {
      console.error(err)
      return {}
    }
  }
}
