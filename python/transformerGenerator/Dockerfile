FROM --platform=linux/amd64 public.ecr.aws/lambda/python:3.10

COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install -r requirements.txt

# copy remaining project files
COPY . ${LAMBDA_TASK_ROOT}

# Pass the name of the function handler as an argument to the runtime
CMD [ "app.lambda_handler"]
