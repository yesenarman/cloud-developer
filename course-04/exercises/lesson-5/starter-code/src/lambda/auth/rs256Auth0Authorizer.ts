import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { verify } from 'jsonwebtoken'
import 'source-map-support/register'
import { JwtToken } from '../../auth/JwtToken'

const authCertificate = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJCRhdOyb2Fw45MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1yanVsdjE0dS5hdXRoMC5jb20wHhcNMjAwNjA1MDQyNTE5WhcNMzQw
MjEyMDQyNTE5WjAhMR8wHQYDVQQDExZkZXYtcmp1bHYxNHUuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9H1naC74kNKYgew5/Ng8QeTM
LWezeVOQb/fJMStGO3dcyNbL7BjDwr2ibXrVhz73P/9waDUlXn6/am0cdS90UX38
kXrbzoLRAxX3wAiHxSqHVWYxzc7EnDfPyNmz94CMbKQCgL2MvlCMnEeiQ9ryo/Rs
5ijUCM47Xe0KoWoZHDSGjUyHQUAp2aCWDMW537j0DcKAM8di3PVEI8XP7RFtr7kN
moHz980COKqQ3e3o+U0TLbnkgVOd1zOd6vpbMYOV+/Bpn48IVkrjnrawYrOQ+QaK
bQVxk+yZLsONS9QjHNmsdbfRlBdNid/xI5hB8oNwtx+F6Mn9UKY07h1OlFVoWwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSyTg1QPOxPtELVWonM
S71TpVl8bjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAKGWO66b
yfLl3aKMAZYRGe/aehFoN00/UnaFHMLIXcBAv+7/KFWvJfHwYjBPPueeVT4JaZgY
c1i1CIx6x6VMWf2Gm4+S3skJF1OqZP72g7QaFx2Qawar/l/p4ZOAJcRH5FczWS0R
/5HHBr8g9hXYcMilHMsMOTr4UPuT4rPeOJ6V6nKEuz+w/n6HcpfN7CQZI+kWk/nk
YNNMkvFLT6XiU7Yc+FgVvALSLrHp2mZOau9B/Gp64SZJtkDcBXR14dh+1j+cVXml
Z1JzBoq4ughollHqOTYQlWJ2WPGJBU1dgZSLuWFO1Q05pFsb3DWiizaTSPYXQxPv
aXjyYEAIiTLDGA0=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', decodedToken)

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(
    token,
    authCertificate,
    { algorithms: ['RS256']}
  ) as JwtToken
}
