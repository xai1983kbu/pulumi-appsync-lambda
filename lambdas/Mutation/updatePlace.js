exports.updatePlaceCallbackFactory = () => {
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
    let title
    if ('title' in event.arguments) {
      title = event.arguments.title
    }
    let content
    if ('content' in event.arguments) {
      content = event.arguments.content
    }
    let imgBucket, imgRegion, imgKey
    if (
      'imgBucket' in event.arguments &&
      'imgRegion' in event.arguments &&
      'imgKey' in event.arguments
    ) {
      imgBucket = event.arguments.imgBucket
      imgRegion = event.arguments.imgRegion
      imgKey = event.arguments.imgKey
    }

    try {
      let newJsonPlaceInfo
      // get point from geo DynamoDB
      const point = await myGeoTableManager
        .getPoint({
          RangeKeyValue: { S: id },
          GeoPoint: {
            // https://github.com/rh389/dynamodb-geo.js/blob/master/src/types.ts
            latitude,
            longitude
          },
          GetItemInput: {}
        })
        .promise()
      if ('Item' in point) {
        newJsonPlaceInfo = JSON.parse(point['Item']['jsonPlaceInfo']['S'])
        console.log('---Item---', newJsonPlaceInfo)
      } else {
        console.log('---No Item---', point)
        throw `Point this id: ${id}, latitude: ${latitude} an longitude: ${longitude} wasn't found!`
      }

      if (title && title.length <= 250) {
        newJsonPlaceInfo['title'] = title
      } else if (title && title.length > 250) {
        throw 'Length of Title is more than 250 characters'
      }

      if (content && content.length <= 2500) {
        newJsonPlaceInfo['content'] = content
      } else if (content && content.length > 2500) {
        throw 'Length of Content is more than 2500 characters'
      }

      if (imgBucket && imgRegion && imgKey) {
        newJsonPlaceInfo['images'][0]['bucket'] = imgBucket
        newJsonPlaceInfo['images'][0]['region'] = imgRegion
        newJsonPlaceInfo['images'][0]['key'] = imgKey
      }

      console.log(newJsonPlaceInfo)

      const dbResult = await myGeoTableManager
        .updatePoint({
          RangeKeyValue: { S: id },
          GeoPoint: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          UpdateItemInput: {
            UpdateExpression: 'SET jsonPlaceInfo = :newJsonPlaceInfo',
            ConditionExpression: 'userIdInPool = :userId',
            ExpressionAttributeValues: {
              ':userId': { S: userId },
              ':newJsonPlaceInfo': { S: JSON.stringify(newJsonPlaceInfo) }
            }
          }
        })
        .promise()
      return {
        ...newJsonPlaceInfo,
        image: {
          ...newJsonPlaceInfo['images']['0']
        }
      }
    } catch (err) {
      console.error(err)
      if (err.code === 'ConditionalCheckFailedException') {
        // https://stackoverflow.com/a/54265310/9783262
        return {
          error: err
        }
      }
      return { error: err }
    }
  }
}
