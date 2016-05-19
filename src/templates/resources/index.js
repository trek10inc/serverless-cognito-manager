'use strict';

module.exports = {
  'Resources.CognitoAuthenticatedRole': require('./cognito-authenticated-role.json'),
  'Resources.CognitoAuthenticatedPolicy': require('./cognito-authenticated-policy.json'),
  'Resources.CognitoUnauthenticatedRole': require('./cognito-unauthenticated-role.json'),
  'Resources.CognitoUnauthenticatedPolicy': require('./cognito-unauthenticated-policy.json'),
  'Outputs.CognitoAuthenticatedRole': require('./cognito-authenticated-role-arn.json'),
  'Outputs.CognitoUnauthenticatedRole': require('./cognito-unauthenticated-role-arn.json')
};
