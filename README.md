# OBSOLETE / ABANDONED NOTICE

I would not suggest using this for any reason. This only supported early versions of serverless and there are better ways to handle a lot of this now.

I would highly suggest using CloudFormation to manage your Cognito resources.

See
- [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-identitypool.html](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-identitypool.html)
- [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html)


Serverless Cognito Manager
=============================

A plugin for creating and managing Cognito Federated Identity Pools, and User Identity Pools within the Serverless Framework.

**Note:** This is still very much in development, but should be operable. More details for the readme are coming soon.

## Getting Started

`npm install serverless-cognito-manager`

```
# s-project.json

"plugins" : [
	"serverless-cognito-manager"
]
```

**Prep Step**
Setup your entire project with various configurations and defaults quickly. For an idea of what all gets populated by the scaffold function check out the `src/templates` directory of this plugin.
`serverless cognito scaffold`

## Configuration

**Deploy Cognito**
`serverless cognito deploy -s {stage} -r {region}`

**Remove Cognito**
`serverless cognito remove -s {stage} -r {region}`
