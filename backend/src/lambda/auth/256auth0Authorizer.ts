import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJV3mvF8YZBcRYMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1xbXlzejlyeC51cy5hdXRoMC5jb20wHhcNMjIxMDEwMDkyNzAyWhcN
MzYwNjE4MDkyNzAyWjAkMSIwIAYDVQQDExlkZXYtcW15c3o5cngudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtYQfe5MH+h8bGxEZ
AFQQ3PWyJT6Cn/pDQNOPuQAs9N+GSeXuQHsYlHA6E3ni8tyyzqgEx4m/QCY4Kb3R
Z6v5wfOAaIyB8MKCfci2Ef+ito7h/i4lTOwVR1Vs8lXgwqAhFrsN9UWFQD0JdrvF
Te5GOHEaxQvi/XFsfHP6DTdBxe9lQow+RDmbGLqcS/MmX/yukCj2C3suwl22LXIc
NxuxkcDJoq8Sf+eUFQD0VxZn6zkIv4gafikTZYyQxCXMiqusttqErxObEcrwq+GV
JlNKxdRQ1HBOKdT92kOZ/GP7sAp4Lb4Ro/TfqMK9bm1roHK3+jgVsx0UGL5zwboq
rEU7UQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSUvV3Ke9iX
CTMT18IkzMBcWs/ntzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AJVmwYIF2ux6KuBiKtpZRJBnLdEpOaHefB5N5BXyE3nYobIeAo+P8IwDRNRC9wik
98AIxv/Olzoj6WXGYKiU+eNBOfisxCTRVqFAzf3MAiALrDyD44wD1UJn4zvUZgZH
nF/ZT6vSiY7G1z0YlwFKnj0CVska98JJrDb5/oH6nd4IBCbWXoD5bQ5J3tE7X21s
/tCeUEuJ2KJTA9gqn+Gn0v9FUmll9hXy9MQvvTmY1fmHE0Mresy3zvoLlHSMGKJE
PCSlgp/8xRrCNC3zZHwXYZaHJsWTdkoD0t988zB1wz9NU2tp7eQpzqXtAnpU4Ho3
wXLuiYZWgNKvsvEk5URPUXE=
-----END CERTIFICATE-----`

exports.handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized ', jwtToken)

    return {
      principalId: jwtToken.sub,
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
      console.log('User authorized ', e.message)

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

  if (!authHeader.toLowerCase().startsWith('bearer'))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, {algorithms: ['RS256'] }) as JwtToken
}
