#!/usr/bin/env node

import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface AgentCoreInfraStackProps extends cdk.StackProps {
  ecrRepositoryName: string;
}

export class AgentCoreInfraStack extends cdk.Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope: Construct, id: string, props?: AgentCoreInfraStackProps) {
    super(scope, id, props);

    // Create ECR repository for the agent container
    const agentRepository = new ecr.Repository(this, 'AgentRepository', {
      repositoryName: props?.ecrRepositoryName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      lifecycleRules: [{
        maxImageCount: 5,
        description: 'Keep only 5 most recent images',
      }],
    });

    // Create IAM role for the agent runtime
    const agentRole = new iam.Role(this, 'AgentRuntimeRole', {
      assumedBy: new iam.ServicePrincipal('bedrock-agentcore.amazonaws.com'),
      description: 'Execution role for AgentCore runtime',
    });

    // Agent Role access to ECR Images
    agentRole.addToPolicy(new iam.PolicyStatement({
      sid: 'ECRImageAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'ecr:BatchGetImage',
        'ecr:GetDownloadUrlForLayer',
      ],
      resources: [`arn:aws:ecr:${this.region}:${this.account}:repository/*`],
    }));

    // Agent Role access to CloudWatch Logs
    agentRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess")
    );

    // Agent Role access to X-Ray Tracing
    agentRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords',
        'xray:GetSamplingRules',
        'xray:GetSamplingTargets',
      ],
      resources: ['*'],
    }));

    // Agent Role access Bedrock Model Invocation (including Converse API and Inference Profiles)
    agentRole.addToPolicy(new iam.PolicyStatement({
      sid: 'BedrockModelInvocation',
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
        'bedrock:Converse',
        'bedrock:ConverseStream',
      ],
      resources: [
        'arn:aws:bedrock:*::foundation-model/*',
        `arn:aws:bedrock:${this.region}:${this.account}:inference-profile/*`,
        `arn:aws:bedrock:*:${this.account}:inference-profile/*`,
        `arn:aws:bedrock:${this.region}:${this.account}:*`,
      ],
    }));

    // Outputs
    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: agentRepository.repositoryUri,
      description: 'ECR Repository URI for agent container',
    });

    new cdk.CfnOutput(this, 'RoleArn', {
      value: agentRole.roleArn,
      description: 'IAM Role ARN for AgentCore Runtime',
      exportName: 'AgentCoreRuntimeRoleArn',
    });
  }
}