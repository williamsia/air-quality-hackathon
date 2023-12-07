#!/bin/bash

AFRISET_WEBSITE_BUCKET=$(aws ssm get-parameters --names /afriset/${ENVIRONMENT}/scenario/websiteBucket --query 'Parameters[0].Value' --output text)
aws s3 sync ./dist s3://"$AFRISET_WEBSITE_BUCKET"
