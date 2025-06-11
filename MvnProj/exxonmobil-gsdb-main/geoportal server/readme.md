Use this folder to store sanitized configuration files for geoportal server (the 'GSDB Server').

the files here override the corresponding files in the default geoportal server war file. 

define these environment variables (unless the values are hard-coded in the config files):
- gsdb_elasticUser = username for the backend AWS Opensearch Serverless instance
- gsdb_elasticPassword = password for the backend AWS Opensearch Serverless instance

if AWS Opensearch is used, add:
- awsOpenSearchRegion = AWS Region the serverless environment is deployed in
- awsOpenSearchAccessKeyId = Access key for the serverless environment
- awsOpenSearchSecretAccessKey = Secret access key for the serverless environment
- awsAPIGatewayEndpoint = AWS API Gateway in front of the serverless environment.
