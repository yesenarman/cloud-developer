const AWS = require('aws-sdk')
const axios = require('axios')

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME
// URL of a service to test
const url = process.env.URL

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async (event) => {
  console.log('Received event: ', event)
  const startTime = timeInMs()
  const requestWasSuccessful = await axios.get(url).then(() => 1).catch(() => 0)
  const endTime = timeInMs()

  console.log('Processed: ', {
    event,
    serviceName,
    url,
    startTime,
    endTime,
    latency: endTime - startTime,
    requestWasSuccessful
  })

  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Latency',
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Milliseconds',
        Value: endTime - startTime
      },
      {
        MetricName: 'Successful',
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Count',
        Value: requestWasSuccessful
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()
}

function timeInMs() {
  return new Date().getTime()
}
