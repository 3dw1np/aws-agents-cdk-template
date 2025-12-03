#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib/core';
import { AgentCoreInfraStack } from '../lib/infra-stack';

const app = new cdk.App();

// Infrastructure stack (ECR, IAM)
new AgentCoreInfraStack(app, 'AgentCoreInfra', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  ecrRepositoryName: 'strands_agent_repository',
  description: 'AgentCore Infrastructure: Container registry and IAM roles',
});