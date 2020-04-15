exports.queryRadiusCallbackFactory = () => {
  const AWS = require('aws-sdk')
  AWS.config.update({ region: 'eu-west-1' })

  const ddb = new AWS.DynamoDB()
  const ddbGeo = require('dynamodb-geo')

  const config = new ddbGeo.GeoDataManagerConfiguration(
    ddb,
    'askJames-wheresStarbucks'
  )
  config.hashKeyLength = 5

  const myGeoTableManager = new ddbGeo.GeoDataManager(config)

  return async event => {
    let myLocation

    myLocation = await myGeoTableManager.queryRadius({
      RadiusInMeter: 111900,
      CenterPoint: {
        latitude: 49.473301,
        longitude: 35.001911
      }
    })
    const response = {
      statusCode: 200,
      body: JSON.stringify(myLocation)
    }
    return response
  }
}
