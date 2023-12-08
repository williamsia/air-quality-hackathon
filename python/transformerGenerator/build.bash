#! /bin/bash
set -ex

while getopts r:a: flag
do
    case "${flag}" in
        r) AWS_REGION=${OPTARG};;
        a) AWS_ACCOUNT_ID=${OPTARG};;
    esac
done

if [ -z "$AWS_REGION" ]
then
  echo "AWS_REGION not present"
  exit 1
fi

if [ -z "$AWS_ACCOUNT_ID" ]
then
  echo "AWS_ACCOUNT_ID not present"
  exit 1
fi

# # Build the docker image
docker build --platform linux/amd64 -t afri-set-transformer .

# # Create a ECR repository
# # aws ecr create-repository --repository-name afri-set-transformer --image-scanning-configuration scanOnPush=true

# # Tag the image to match the repository name
docker tag afri-set-transformer:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/afri-set-transformer:latest"

# Register docker to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Push the image to ECR
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/afri-set-transformer:latest"



