'use strict'

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
  console.log('Processing event: ', event)

  let nextKey = null;
  const nextKeyRaw = getQueryParameter(event, 'nextKey');
  if (nextKeyRaw) {
    try {
      nextKey = JSON.parse(decodeURIComponent(nextKeyRaw));
    } catch (e) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Invalid nextKey parameter',
        }),
      };
    }
  }

  const limit = parseInt(getQueryParameter(event, 'limit'));
  if (Number.isNaN(limit) || limit <= 0) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Invalid limit parameter',
      }),
    };
  }

  // Scan operation parameters
  const scanParams = {
    TableName: groupsTable,
    Limit: limit,
    ExclusiveStartKey: nextKey,
  };
  console.log('Scan params: ', scanParams)

  const result = await docClient.scan(scanParams).promise()

  const items = result.Items

  console.log('Result: ', result)

  // Return result
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  }
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}
