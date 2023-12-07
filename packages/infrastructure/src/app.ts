#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AfrisetStack } from "./afriset.stack.js";
import { getOrThrow } from "./tools/util.js";

const app = new cdk.App();

const environment = getOrThrow(app, 'environment');
const administratorEmail = getOrThrow(app, 'administratorEmail');
const redirectUrls = (app.node.tryGetContext('redirectUrls') ?? 'http://localhost:3000/api/auth/callback/cognito').split(',');

const prefix = `afriset-${environment}`;

new AfrisetStack(app, 'AfrisetStack', {environment, administratorEmail, redirectUrls, stackName: `${prefix}-infrastructure`});
