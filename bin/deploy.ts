#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DeployStack } from '../lib/deploy-stack';

const {
  STAGE
} = process.env;

const app = new cdk.App();
new DeployStack(app, `${STAGE}-Tech9HarvestSlackBot`, {});