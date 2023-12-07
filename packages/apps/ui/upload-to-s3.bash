#!/bin/bash

SOSE_WEBSITE_BUCKET=$(aws ssm get-parameters --names /afriSET/${ENVIRONMENT}/scenario/websiteBucket --query 'Parameters[0].Value' --output text)
aws s3 sync ./dist s3://"$SOSE_WEBSITE_BUCKET"
