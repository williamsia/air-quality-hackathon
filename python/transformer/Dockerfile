FROM public.ecr.aws/lambda/python:3.10

COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install the function's dependencies
RUN pip install -r requirements.txt

COPY . ${LAMBDA_TASK_ROOT}

# Pass the name of the function handler as an argument to the runtime
CMD [ "app.lambda_handler"]
