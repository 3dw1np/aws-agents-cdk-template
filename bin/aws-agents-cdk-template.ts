#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib/core';
import { AgentCoreInfraStack } from '../lib/infra-stack';
import { AgentCoreRuntimeStack } from '../lib/runtime-stack';

const app = new cdk.App();

// Infrastructure stack (ECR, IAM)
const infraStack = new AgentCoreInfraStack(app, 'AgentCoreInfra', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  ecrRepositoryName: 'strands_agent_repository',
  description: 'AgentCore Infrastructure: Container registry and IAM roles',
});

// Runtime stack
const runtimeStack = new AgentCoreRuntimeStack(app, 'AgentCoreRuntime', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  agentRepository: infraStack.agentRepository,
  agentRole: infraStack.agentRole,
  agentName: 'strands_agent',
  description: 'AgentCore Runtime: Container-based agent with built-in Cognito authentication',
});