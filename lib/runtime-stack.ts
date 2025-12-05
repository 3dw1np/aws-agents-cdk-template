#!/usr/bin/env node

import path from 'path';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as agentcore from '@aws-cdk/aws-bedrock-agentcore-alpha';

export interface AgentCoreRuntimeStackProps extends cdk.StackProps {
  agentRepository: ecr.Repository;
  agentRole: iam.IRole;
  agentName: string;
}

export class AgentCoreRuntimeStack extends cdk.Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope: Construct, id: string, props?: AgentCoreRuntimeStackProps) {
    super(scope, id, props);

    // Import existing IAM agentRole
    const agentRole = iam.Role.fromRoleArn(
      this,
      'AgentRuntimeRole',
      cdk.Fn.importValue('AgentCoreRuntimeRoleArn')
    );

    const agentRuntimeArtifact = agentcore.AgentRuntimeArtifact.fromAsset(
      path.join(__dirname, '..', 'agents', 'agent-python-strands')
    );

    const agentRuntime = new agentcore.Runtime(this, 'AgentRuntime', {
      runtimeName: props?.agentName || 'MyAgent',
      executionRole: agentRole,
      agentRuntimeArtifact: agentRuntimeArtifact,
    });

    // Outputs
    new cdk.CfnOutput(this, 'AgentRuntimeArn', {
      value: agentRuntime.agentRuntimeArn,
      description: 'AgentCore Runtime ARN',
      exportName: 'AgentCoreRuntimeArn',
    });

    new cdk.CfnOutput(this, 'AgentEndpointName', {
      value: 'DEFAULT',
      description: 'AgentRuntime Endpoint Name (DEFAULT auto-created)',
      exportName: 'AgentCoreEndpointName',
    });
  }
}