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
