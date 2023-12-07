#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AfriSetStack } from "./afriset.stack.js";
import { getOrThrow } from "./tools/util.js";

const app = new cdk.App();

const environment = getOrThrow(app, 'environment');
const administratorEmail = getOrThrow(app, 'administratorEmail');
const redirectUrls = (app.node.tryGetContext('redirectUrls') ?? 'http://localhost:3000/api/auth/callback/cognito').split(',');

const prefix = `afriSET-${environment}`;

new AfriSetStack(app, 'AfriSETStack', {environment, administratorEmail, redirectUrls, stackName: `${prefix}-infrastructure`});
