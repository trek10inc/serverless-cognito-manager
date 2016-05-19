'use strict';

/**
 * Serverless Plugin Boilerplate
 * - Useful example/starter code for writing a plugin for the Serverless Framework.
 * - In a plugin, you can:
 *    - Create a Custom Action that can be called via the CLI or programmatically via a function handler.
 *    - Overwrite a Core Action that is included by default in the Serverless Framework.
 *    - Add a hook that fires before or after a Core Action or a Custom Action
 *    - All of the above at the same time :)
 *
 * - Setup:
 *    - Make a Serverless Project dedicated for plugin development, or use an existing Serverless Project
 *    - Make a "plugins" folder in the root of your Project and copy this codebase into it. Title it your custom plugin name with the suffix "-dev", like "myplugin-dev"
 *    - Run "npm link" in your plugin, then run "npm link myplugin" in the root of your project.
 *    - Start developing!
 *
 * - Good luck, serverless.com :)
 */

module.exports = function(S) {
  // Always pass in the ServerlessPlugin Class and Serverless path

  const path    = require('path'),
      Zip       = require('node-zip'),
      BbPromise = require('bluebird'), // Serverless uses Bluebird Promises and we recommend you do to because they provide more than your average Promise :)
      _         = require('lodash'),
      SUtils    = S.utils,
      SCli      = require(S.getServerlessPath('utils/cli')),
      SError    = require(S.getServerlessPath('Error')),
      utils     = require('./utils.js');

  /**
   * ServerlessPluginBoierplate
   */

  class ServerlessPluginCognitoManager extends S.classes.Plugin {

    /**
     * Constructor
     * - Keep this and don't touch it unless you know what you're doing.
     */

    constructor() {
      super();
      this.name = 'serverless-cognito-manager';
    }

    /**
     * Define your plugins name
     * - We recommend adding prefixing your personal domain to the name so people know the plugin author
     */

    static getName() {
      return this.name;
    }

    /**
     * Register Actions
     * - If you would like to register a Custom Action or overwrite a Core Serverless Action, add this function.
     * - If you would like your Action to be used programatically, include a "handler" which can be called in code.
     * - If you would like your Action to be used via the CLI, include a "description", "context", "action" and any options you would like to offer.
     * - Your custom Action can be called programatically and via CLI, as in the example provided below
     */

    registerActions() {

      S.addAction(this._scaffoldAction.bind(this), {
        handler:        'scaffoldAction',
        description:    'Puts the defaults into s-project.json “custom” section AND add default IAM roles to to the “cloudFormation” section in s-project.json',
        context:        'cognito',
        contextAction:  'scaffold',
        options:        [],
        parameters:     []
      });

      S.addAction(this._deployAction.bind(this), {
        handler:        'deployAction',
        description:    'Should create the cognito identity pools and user identity pools and / or deploy all relevant changes for the given stage.',
        context:        'cognito',
        contextAction:  'deploy',
        options:        [
          {
            option:       'stage',
            shortcut:     's',
            description:  'Deploy stage'
          },
          {
            option:       'region',
            shortcut:     'r',
            description:  'Deploy region'
          }
        ],
        parameters:     []
      });

      S.addAction(this._removeAction.bind(this), {
        handler:        'removeAction',
        description:    'Should remove all relevant details from given stage.',
        context:        'cognito',
        contextAction:  'remove',
        options:        [
          {
            option:       'stage',
            shortcut:     's',
            description:  'Remove stage'
          },
          {
            option:       'region',
            shortcut:     'r',
            description:  'Remove region'
          }
        ],
        parameters:     []
      });

      S.addAction(this._triggersAction.bind(this), {
        handler:        'triggersAction',
        description:    '',
        context:        'cognito',
        contextAction:  'triggers',
        options:        [
          {
            option:       'stage',
            shortcut:     's',
            description:  'Deploy Lambda Triggers stage'
          },
          {
            option:       'region',
            shortcut:     'r',
            description:  'Deploy Lambda Triggers region'
          }
        ],
        parameters:     []
      });

      return BbPromise.resolve();
    }

    _copyFiles (fileNames, originDirectory, destinationDirectory, prefix) {
      if (!prefix) {
        prefix = '';
      }
      return BbPromise.all(fileNames.map(fileName => {
        let originalFileName = path.resolve(originDirectory, fileName),
            destinationFileName = path.resolve(destinationDirectory, prefix + fileName);
        return SUtils.readFile(originalFileName)
          .then(data => {
            return SUtils.writeFile(destinationFileName, data);
          });
      }));
    }

    _promptTriggers (object) {
      // TODO: Actually implement triggers properly
      return BbPromise.resolve(object);
      //
      // let _this = this,
      //     promptSchema = {
      //   properties: {
      //     create: {
      //       description: 'Do create Lambda Triggers? 0 - No (default), 1 - Yes',
      //       type: 'string',
      //       default: '0',
      //       required: true,
      //       pattern: /^[01]$/,
      //       message: 'Only numbers 0 and 1 are accepted',
      //       before: function (value) { return !!parseInt(value); }
      //     }
      //   }
      // };
      // if (_this._spinner) {
      //   _this._spinner.stop(true);
      // }
      // return new BbPromise((resolve, reject) => {
      //   _this.cliPromptInput(promptSchema, null)
      //     .then(result => {
      //       if (!result.create) {
      //         SCli.log('Rejected create Lambda Triggers');
      //         _.set(object, 'custom.cognitoUserIdentityPool.LambdaConfig.CustomMessage', '');
      //         _.set(object, 'custom.cognitoUserIdentityPool.LambdaConfig.PostAuthentication', '');
      //         _.set(object, 'custom.cognitoUserIdentityPool.LambdaConfig.PostConfirmation', '');
      //         _.set(object, 'custom.cognitoUserIdentityPool.LambdaConfig.PreAuthentication', '');
      //         _.set(object, 'custom.cognitoUserIdentityPool.LambdaConfig.PreSignUp', '');
      //       } else {
      //         SCli.log('Accepted create Lambda Triggers');
      //       }
      //       if (_this._spinner) { _this._spinner.start(); }
      //       resolve(object);
      //     })
      //     .catch(err => {
      //       if (err.message === 'canceled') {
      //         SCli.log('Cancelled create Lambda Triggers');
      //         if (_this._spinner) { _this._spinner.start(); }
      //         resolve(object);
      //       } else {
      //         console.error(err);
      //         reject();
      //       }
      //     });
      // });
    }

    _promptOverride (fileName, object) {
      let promptSchema = {
        properties: {
          override: {
            description: `Do override exiting file: '${fileName}?' 0 - No (default), 1 - Yes`,
            type: 'string',
            default: '0',
            required: true,
            pattern: /^[01]$/,
            message: 'Only numbers 0 and 1 are accepted',
            before: function (value) { return !!parseInt(value); }
          }
        }
      };
      if (this._spinner) {
        this._spinner.stop(true);
      }
      return new BbPromise((resolve, reject) => {
        this.cliPromptInput(promptSchema, null)
          .then(result => {
            if (result.override) {
              SCli.log(`Override file '${fileName}'`);
              if (this._spinner) { this._spinner.start(); }
              resolve(this._saveToJson(fileName, object).then(() => {return true;}));
            } else {
              SCli.log(`Cancelled update file '${fileName}'`);
              if (this._spinner) { this._spinner.start(); }
              resolve(false);
            }
          })
          .catch(err => {
            if (err.message === 'canceled') {
              SCli.log(`Cancelled update file '${fileName}'`);
              resolve(false);
            } else {
              console.error(err);
              reject();
            }
          });
      });
    }

    _scaffoldCF () {

      // We should check for overwrite (pre-existing stuff)
      //   and CONFIRM via prompt they really want to overwrite everything
      let resourcesTemplate = {};
      let fileName = this._getCFConfigFileName();
      SCli.log('Resource template path: ' + fileName);
      if (SUtils.fileExistsSync(fileName)) {
        resourcesTemplate = SUtils.readFileSync(fileName) || {};
      }
      if (resourcesTemplate) {
        let resources = require('./templates').resources;
        for (let key in resources) {
          if (resources.hasOwnProperty(key)) {
            _.set(resourcesTemplate, key, resources[key]);
          }
        }
      }
      return this._promptOverride(fileName, resourcesTemplate);
    }

    _scaffoldLambdaTriggers (overridden, object) {
      let _this = this,
          originDirectory = path.resolve(__dirname, 'templates', 'triggers'),
          destinationDirectory = S.getProject().getRootPath('cognitoTriggers'),
          projectName = S.getProject().getName(),
          filenames = _.chain(object)
            .get('custom.cognitoUserIdentityPool.LambdaConfig')
            .omitBy(value => {
              return _.isEmpty(value);
            })
            .mapKeys((value, key) => {
              return _.kebabCase(key) + '.js';
            })
            .keys()
            .value();
      if (_.isEmpty(filenames) || !overridden) {
        return BbPromise.resolve();
      }
      let project = S.getProject(),
          prefixes = project.getAllStages().map(stage => {
            return `${projectName}-${stage.name}-`;
          });
      return BbPromise.all(prefixes.map(prefix => {
        return _this._copyFiles(filenames, originDirectory, destinationDirectory, prefixes);
      }));
    }

    _scaffoldProject () {
      let _this = this,
          projectConfig = {},
          fileName = _this._getProjectConfigFileName();
      SCli.log('Project config path: ' + fileName);
      if (SUtils.fileExistsSync(fileName)) {
        projectConfig = SUtils.readFileSync(fileName) || {};
      }
      if (projectConfig) {
        let config = require('./templates').config;
        for (let key in config) {
          if (config.hasOwnProperty(key)) {
            _.set(projectConfig, key, config[key]);
          }
        }
      }
      return _this._promptTriggers(projectConfig)
        .then(projectConfig => {
          return _this._promptOverride(fileName, projectConfig);
        })
        .then(overridden => {
          return _this._scaffoldLambdaTriggers(overridden, projectConfig);
        });
    }

    _getDeployVariablesFileName (stage, region) {
      if (!stage || !region) {
        throw new SError('Stage and/or region not specified!');
      }
      let regionSanitized = region.toString().replace(/\-/g, '');
      let fileName = 's-variables-' + stage + '-' + regionSanitized + '.json';
      return S.getProject().getRootPath('_meta', 'variables', fileName);
    }

    _getProjectConfigFileName () {
      return S.getProject().getRootPath('s-project.json');
    }

    _getCFConfigFileName () {
      return S.getProject().getRootPath('s-resources-cf.json');
    }

    _saveToJson (fileName, object) {
      return SUtils.writeFile(fileName, JSON.stringify(object, null, 2));
    }

    _scaffoldAction (evt) {
      SCli.log('Run: serverless cognito scaffold');
      this.evt = evt;
      this._spinner = SCli.spinner();
      this._spinner.start();
      return this._scaffoldCF()
        .then(() => {
          return this._scaffoldProject();
        })
        .then(() => {
          this._spinner.stop(true);
          return this.evt;
        })
        .catch(err => {
          this._spinner.stop(true);
          throw new SError(err);
        });
    }

    _createRoleWithInlinePolicy (role, policy, stage, region) {
      let aws = S.getProvider('aws');
      let roleArn, roleName;
      return new BbPromise((resolve, reject) => {
        aws.request('IAM', 'createRole', role, stage, region, {})
        .then(roleData => {
          roleArn = _.get(roleData, 'Role.Arn');
          roleName = _.get(roleData, 'Role.RoleName');
          return aws.request('IAM', 'putRolePolicy', policy, stage, region, {});
        })
        .then(policyData => {
          return aws.request('IAM', 'getRole', {
            RoleName: roleName
          }, stage, region, {});
        })
        .then(roleData => {
          resolve(roleData);
        })
        .catch(reject);
      });
    }

    _getLambdaExecRoleArn (projectConfig, stage, region) {
      let _this = this,
          aws = S.getProvider('aws'),
          projectName = S.getProject().getName(),
          roleName = `${projectName}-${stage}-lambda-trigger-exec-role`;
      return new BbPromise((resolve, reject) => {
        aws.request('IAM', 'getRole', { RoleName: roleName }, stage, region, {})
        .then(roleData => {
          resolve(_.get(roleData, 'Role.Arn'));
        })
        .catch(err => {
          if (err.code === 'NoSuchEntity') {
            let policyName = `${projectName}-${stage}-lambda-trigger-exec-policy`;
            let lambdaExec = require('./templates').lambdaExec;
            let role = {
              AssumeRolePolicyDocument: JSON.stringify(lambdaExec.role),
              RoleName: roleName,
              Path: '/'
            };
            let policy = {
              PolicyDocument: JSON.stringify(lambdaExec.policy),
              PolicyName: policyName,
              RoleName: roleName
            };
            _this._createRoleWithInlinePolicy(role, policy, stage, region)
            .then(roleData => {
              resolve(_.get(roleData, 'Role.Arn'));
            })
            .catch(err => {
              reject(new SError(err.message));
            });
          } else {
            reject(new SError(err.message));
          }
        });
      });
    }

    _deployLambdaTriggers (projectConfig, stage, region) {
      return BbPromise.resolve();
      // let _this = this,
      //     aws = S.getProvider('aws'),
      //     cognitoTriggersDirectory = S.getProject().getRootPath('cognitoTriggers'),
      //     lambdaConfig = _.get(projectConfig, 'custom.cognitoUserIdentityPool.LambdaConfig');
      // let files = _.chain(lambdaConfig)
      //   .omitBy((value, key) => { return _.isEmpty(value); })
      //   .mapValues((value, key) => {
      //     return path.resolve(cognitoTriggersDirectory, value + '.js');
      //   })
      //   .omitBy((value, key) => { return !SUtils.fileExistsSync(value); })
      //   .value();
      // return _this._getLambdaExecRoleArn(projectConfig, stage, region)
      // .then(lambdaExecRoleArn => {
      //   let lambdas = [];
      //   _.forEach(files, function (fileName, key) {
      //     let functionName = lambdaConfig[key];
      //     let file = SUtils.readFileSync(fileName);
      //     let zip = new Zip();
      //     zip.file(functionName + '.js', file);
      //     let compressedFile = zip.generate({
      //       base64: false,
      //       compression: 'DEFLATE'
      //     });
      //     lambdas.push(new BbPromise((resolve, reject) => {
      //       aws.request('Lambda', 'getFunction', {
      //         FunctionName: functionName
      //       }, stage, region, {})
      //       .then(lambdaFunction => {
      //         let params = {
      //           FunctionName: functionName,
      //           ZipFile: new Buffer(compressedFile, 'binary'),
      //           Publish: true
      //         };
      //         resolve(aws.request('Lambda', 'updateFunctionCode', params, stage, region, {}));
      //       })
      //       .catch(err => {
      //         if (err.code === 'ResourceNotFoundException') {
      //           let params = {
      //             Code: {
      //               ZipFile: new Buffer(compressedFile, 'binary')
      //             },
      //             FunctionName: functionName,
      //             Handler: `${functionName}.handler`,
      //             Role: lambdaExecRoleArn,
      //             Runtime: 'nodejs4.3',
      //             Description: key,
      //             Publish: true
      //           };
      //           resolve(aws.request('Lambda', 'createFunction', params, stage, region, {}));
      //         } else {
      //           reject(err);
      //         }
      //       });
      //     }));
      //   });
      //   return BbPromise.all(lambdas);
      // });
    }

    _triggersAction (evt) {
      SCli.log('TEST Action');
      let _this = this,
          stage = evt.options.stage,
          region = evt.options.region;
      _this.project    = S.getProject();
      _this.populatedProject = _this.project.toObjectPopulated({stage: stage, region: region});
      // _this._deployLambdaTriggers(_this.populatedProject, stage, region);
      return BbPromise.resolve(evt);
    }

    _deployAction (evt) {

      let _this = this,
          stage = evt.options.stage,
          region = evt.options.region,
          projectName = S.getProject().name;

      // Deploy validations

      // validate stage: make sure stage exists
      if (!S.getProject().validateStageExists(stage)) {
        return BbPromise.reject(new SError('Stage ' + stage + ' does not exist in your project', SError.errorCodes.UNKNOWN));
      }

      // make sure region exists in stage
      if (!S.getProject().validateRegionExists(stage, region)) {
        return BbPromise.reject(new SError('Region "' + region + '" does not exist in stage "' + stage + '"'));
      }

      _this.project    = S.getProject();
      _this.aws        = S.getProvider('aws');

      _this.populatedProject = _this.project.toObjectPopulated({stage: stage, region: region});

      // Configs check
      if (!_this.populatedProject.custom.cognitoUserIdentityPool && !_this.populatedProject.custom.cognitoIdentityPool) {
        return BbPromise.reject(new SError('Please run "serverless cognito scaffold" to get started'));
      } else if (!_this.populatedProject.custom.cognitoUserIdentityPool) {
        return BbPromise.reject(new SError('You are missing User Identity Pool Configs!'));
      } else if (!_this.populatedProject.custom.cognitoIdentityPool) {
        return BbPromise.reject(new SError('You are missing Identity Pool Configs!'));
      }

      // Populated variables grabbed here, we should use this throughout
      let variables = _.get(_this.populatedProject, `stages.${stage}.regions.${region}.variables`);

      // Already exists, don't create again and again
      if(variables.cognitoUserIdentityPoolId){
        return BbPromise.reject(new SError('Identity pool already exists for this stage / region!'));
      }

      var spinner = SCli.spinner();
      spinner.start();
      SCli.log(`Run: serverless cognito deploy -s ${stage} -r ${region} `);

      let variableFileName = _this._getDeployVariablesFileName(stage, region);
      let projectConfig = S.getProject();

      let paramsUserPool = _.get(projectConfig, 'custom.cognitoUserIdentityPool', {
        PoolName: 'Sample User Pool'
      });
      let paramsIdentityPool = _.get(projectConfig, 'custom.cognitoIdentityPool', {
        AllowUnauthenticatedIdentities: false,
        IdentityPoolName: 'Sample Identity Pool'
      });
      return _this._deployLambdaTriggers(_this.populatedProject, stage, region)
        .then(() => {
          // We should use _this.populatedProject instead of mapping on our own
          let map = {
            'project': projectName,
            'stage': stage
          };
          let paramsUserPoolPopulated = utils.populateTemplate(paramsUserPool, map);
          return _this.aws.request('CognitoIdentityServiceProvider', 'createUserPool', paramsUserPoolPopulated, stage, region, {});
        })
        .then(userPool => {
          variables.cognitoUserIdentityPoolId = userPool.UserPool.Id;
          spinner.stop(true);
          SCli.log('User Pool created with Id: ' + variables.cognitoUserIdentityPoolId);
          spinner.start();
          return _this.aws.request('CognitoIdentityServiceProvider', 'createUserPoolClient', {
            ClientName: projectName + '-' + stage + '-client',
            GenerateSecret: true,
            UserPoolId: variables.cognitoUserIdentityPoolId
          }, stage, region, {});
        })
        .then(userPoolClient => {
          variables.cognitoUserIdentityPoolClientId = userPoolClient.UserPoolClient.ClientId;
          variables.cognitoUserIdentityPoolClientSecret = userPoolClient.UserPoolClient.ClientSecret;
          spinner.stop(true);
          SCli.log('User Pool Client App created with Id:' + variables.cognitoUserIdentityPoolClientId);
          spinner.start();
          // We should use _this.populatedProject instead of mapping on our own
          let map = {
            'project': _.chain(projectName).lowerCase().upperFirst().value(),
            'stage': _.chain(stage).lowerCase().upperFirst().value(),
            'region': region,
            'cognitoUserIdentityPoolId': variables.cognitoUserIdentityPoolId,
            'cognitoUserIdentityPoolClientId': variables.cognitoUserIdentityPoolClientId
          };
          let paramsIdentityPoolPopulated = utils.populateTemplate(paramsIdentityPool, map);
          delete paramsIdentityPoolPopulated.Roles;

          return _this.aws.request('CognitoIdentity', 'createIdentityPool', paramsIdentityPoolPopulated, stage, region);
        })
        .then (identityPool => {
          spinner.stop(true);
          variables.cognitoIdentityPoolId = identityPool.IdentityPoolId;
          SCli.log('Idenity Pool created with Id:' + variables.cognitoIdentityPoolId);
          spinner.start();
          return _this._saveToJson(variableFileName, variables);
        })
        .then(() => {
          spinner.stop(true);
          SCli.log('Variables updated');
          return BbPromise.resolve(evt);
        })
        .catch(err => {
          spinner.stop(true);
          console.error('Error:', err);
        });
    }

    _removeAction (evt) {
      let _this = this,
          stage = evt.options.stage,
          region = evt.options.region,
          projectName = S.getProject().name;

      _this.aws        = S.getProvider('aws');

      var spinner = SCli.spinner();
      spinner.start();
      let variableFileName = this._getDeployVariablesFileName(stage, region);
      let variables = {};
      try { variables = require(variableFileName); } catch (e) {}
      if (!_.isEmpty(variables.cognitoUserIdentityPoolId) && !_.isEmpty(variables.cognitoIdentityPoolId)) {
        return _this.aws.request('CognitoIdentity', 'deleteIdentityPool', {
          IdentityPoolId: variables.cognitoIdentityPoolId
        }, stage, region, {})
        .then(() => {
          spinner.stop(true);
          SCli.log('Identity Pool with Id ' + variables.cognitoIdentityPoolId + ' removed');
          spinner.start();
          return _this.aws.request('CognitoIdentityServiceProvider', 'deleteUserPool', {
            UserPoolId: variables.cognitoUserIdentityPoolId
          }, stage, region, {});
        })
        .then(() => {
          spinner.stop(true);
          SCli.log('User Pool with Id ' + variables.cognitoUserIdentityPoolId + ' removed');
          SCli.log('Also removed client with Id ' + variables.cognitoUserIdentityPoolClientId);
          spinner.start();
          delete variables.cognitoIdentityPoolId;
          delete variables.cognitoUserIdentityPoolId;
          delete variables.cognitoUserIdentityPoolClientId;
          delete variables.cognitoUserIdentityPoolClientSecret;
          return _this._saveToJson(variableFileName, variables);
        })
        .then(() => {
          spinner.stop(true);
          SCli.log('Variables updated');
          return BbPromise.resolve(evt);
        })
        .catch(err => {
          spinner.stop(true);
          console.error('Error:', err);
        });
      } else {
        SCli.log('User Pool Id is not specified in variables!');
        return BbPromise.reject(evt);
      }
    }
  }

  // Export Plugin Class
  return ServerlessPluginCognitoManager;
};

// Godspeed!
