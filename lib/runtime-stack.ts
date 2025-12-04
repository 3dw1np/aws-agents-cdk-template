#!/usr/bin/env node

import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface AgentCoreRuntimeStackProps extends cdk.StackProps {
  ecrRepositoryName: string;
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

    // Use existing ECR repository
    const agentRepository = ecr.Repository.fromRepositoryName(
      this,
      'AgentRepository',
      'strands_agent_repository'
    );

    // Import existing IAM agentRole
    const agentRole = iam.Role.fromRoleArn(
      this,
      'AgentRuntimeRole',
      cdk.Fn.importValue('AgentCoreRuntimeRoleArn')
    );
  }
}