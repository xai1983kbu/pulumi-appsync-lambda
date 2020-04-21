exports.queryRadiusCallbackFactory = () => {
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
    const radius = event.arguments.radius
    const latitude = event.arguments.centerPoint.latitude
    const longitude = event.arguments.centerPoint.longitude

    const myLocations = await myGeoTableManager.queryRadius({
      RadiusInMeter: radius,
      CenterPoint: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    })

    let foundLocations = []
    myLocations.forEach(location => {
      const locationCoordinates = JSON.parse(location.geoJson.S)['coordinates']
      foundLocations.push({
        latitude: locationCoordinates[0],
        longitude: locationCoordinates[1],
        name: location.name.S,
        address: location.address.S,
        phone: location.phone.S !== 'empty' ? location.phone.S : undefined
      })
    })

    const response = {
      statusCode: 200,
      body: JSON.stringify(foundLocations)
    }
    return foundLocations

    // const radius = event.arguments.radius
    // const latitude = event.arguments.centerPoint.latitude
    // const longitude = event.arguments.centerPoint.longitude

    // return {
    //   statusCode: 200,
    //   body: JSON.stringify(
    //     `radius: ${radius}; latitude: ${latitude}; longitude: ${longitude}`
    //   )
    // }
  }
}
