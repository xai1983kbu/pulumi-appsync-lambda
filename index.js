'use strict'
const pulumi = require('@pulumi/pulumi')
const aws = require('@pulumi/aws')
const awsx = require('@pulumi/awsx')

const random = require('@pulumi/random')

const fs = require('fs')
const secret = require('./secret')

// Add the ability to read .graphql files as strings.
require.extensions['.graphql'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8')
}

// Read the GraphQL Schema as a string.
const graphQLSchema = require('./schema.graphql')

const graphQLApiCloudWatchLogsRole = new aws.iam.Role(
  'graphQLApiCloudWatchLogsRole',
  {
    assumeRolePolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Service: 'appsync.amazonaws.com'
          },
          Action: 'sts:AssumeRole'
        }
      ]
    })
  }
)

const graphQLApiCloudWatchLogsRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  'graphQLApiCloudWatchLogsRolePolicyAttachment',
  {
    policyArn:
      'arn:aws:iam::aws:policy/service-role/AWSAppSyncPushToCloudWatchLogs',
    role: graphQLApiCloudWatchLogsRole.name
  }
)

const graphQLApi = new aws.appsync.GraphQLApi('graphQLApi', {
  authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  logConfig: {
    cloudwatchLogsRoleArn: graphQLApiCloudWatchLogsRole.arn,
    fieldLogLevel: 'ERROR'
  },
  userPoolConfig: {
    awsRegion: 'us-east-1',
    defaultAction: 'ALLOW',
    userPoolId: secret.userPool.id
  },
  schema: graphQLSchema
})

const lambda = new aws.lambda.CallbackFunction('lambdaForAppSync', {
  callback: async e => {
    const responseBody = {
      id: 1,
      title: 'First Post - Pulumi AppSync with Lambda as DataSource'
    }

    return responseBody
  }
})

const lambdaDataSourceRandomString = new random.RandomString(
  'lambda-DataSource-ForAppSync',
  {
    length: 15,
    special: false,
    number: false
  }
)

//-------------

const graphQLDataSourceServiceRole = new aws.iam.Role(
  'apsync_datasourceLamda_Role',
  {
    assumeRolePolicy: `{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "appsync.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
  `
  }
)

const graphQLDataSourceServiceRolePolicy = new aws.iam.RolePolicy(
  'graphQLDataSourceServiceRolePolicy',
  {
    policy: pulumi.interpolate`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:invokeFunction"
            ],
            "Resource": [
                "${lambda.arn}",
                "${lambda.arn}:*"
            ]
        }
    ]
}`,
    role: graphQLDataSourceServiceRole.id
  }
)

//-------------

const lambdaDataSource = new aws.appsync.DataSource(
  'lambda-DataSource-ForAppSync',
  {
    name: lambdaDataSourceRandomString.result,
    apiId: graphQLApi.id,
    lambdaConfig: {
      functionArn: lambda.arn
    },
    awsRegion: 'us-east-1',
    type: 'AWS_LAMBDA',
    serviceRoleArn: graphQLDataSourceServiceRole.arn
  }
)

const graphQLResolver = new aws.appsync.Resolver(`graphQLResolver_AWS_LAMBDA`, {
  apiId: graphQLApi.id,
  dataSource: lambdaDataSource.name,
  requestTemplate: `{
    "version" : "2017-02-28",
    "operation": "Invoke",
    "payload": $util.toJson($context.arguments)
}`,
  responseTemplate: '$utils.toJson($context.result)',
  field: 'singlePost',
  type: 'Query'
})

// exports.bucketName = graphQLApi.id
