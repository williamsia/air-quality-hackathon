####  BEGIN HACK: for runtime botocore taking precedance over site packages
import pkg_resources
import sys
import base64

site_packages = "/var/lang/lib/python3.10/site-packages"
try:
    sys.path.remove(site_packages)
except ValueError:
    pass
else:
    sys.path.insert(0, site_packages)
    for dist in pkg_resources.find_distributions(site_packages, True):
        pkg_resources.working_set.add(dist, site_packages, False, replace=True)
#### END HACK:


import os
from langchain.embeddings import BedrockEmbeddings
from langchain.llms.bedrock import Bedrock
from utils import bedrock
from langchain.document_loaders import DirectoryLoader
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from prompt_templates.create_transformer import create_transformer_prompt
from prompt_templates.transform import transform_prompt
import boto3
import uuid

class MissingParametersException(Exception): pass

NOTIFICATION_LAMBDA=os.environ.get("NOTIFICATION_LAMBDA", None)

# clients
bedrock_client = bedrock.get_bedrock_client(
    assumed_role=os.environ.get("BEDROCK_ASSUME_ROLE", None),
    region=os.environ.get("AWS_DEFAULT_REGION", None),
    runtime=True
)
s3_client = boto3.client('s3')
lambda_client = boto3.client('lambda')

def notify(status:str, stepNumber:int):
    # Send notification to websocket
    lambda_client.invoke (
        FunctionName=NOTIFICATION_LAMBDA,
        InvocationType='RequestResponse',
        Payload='{"status": "' + status + '","stepNumber":'  + str(stepNumber) + '}'
    )

def configure_langchain():
    llm = Bedrock(model_id="anthropic.claude-v2:1", client=bedrock_client, model_kwargs={'max_tokens_to_sample':10000})
    bedrock_embeddings = BedrockEmbeddings(model_id="amazon.titan-embed-text-v1", client=bedrock_client)
    return (llm, bedrock_embeddings)

def load_mapping_docs():
    loader = DirectoryLoader('./mappings', glob="**/*.md")
    docs = loader.load()
    avg_doc_length = lambda documents: sum([len(doc.page_content) for doc in docs])//len(docs)
    avg_char_count = avg_doc_length(docs)
    print(f'Average length among {len(docs)} documents loaded is {avg_char_count} characters.')
    return docs

def initialize_vector_store(docs, embeddings):
    vs = FAISS.from_documents(
        docs,
        embeddings,
    )
    return vs

def execute(prompt, query) :
    print("prompt:\n", prompt)
    print("query:\n", query)

    qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vector_store.as_retriever(
            search_type="similarity", search_kwargs={"k": 3}
        ),
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt}
    )
    answer = qa({"query": query})

    print("answer:\n", answer)
    return answer['result']

def lambda_handler(event, context):

    responses=[]

    for record in event['Records']:
        # retrieve the file details to process, and download locally
        try:
            bucket : str = record['s3']['bucket']['name']
            key : str = record['s3']['object']['key']
            print(f"Processing {bucket}/{key}.")
        except (KeyError, IndexError):
            print("ERROR: Missing S3 bucket and name in event.")
            notify("error", 1)
            continue

        local_file_name = os.path.join('/tmp', str(uuid.uuid4()))
        s3_client.download_file(bucket, key, local_file_name)

        # in creating the transformer we only need a portion of the file
        with open(local_file_name) as f:
            input_data = f.readlines(20)

        query = """
Map the following provided within the <data></data> XML tag to the AFRI_SET_COMMON format:
<data>""" + '\n'.join(input_data) + """
</data>
"""
        result : str = execute(create_transformer_prompt, query)

        # hack to improve - extract the class from the result
        start_token = "<python>"
        end_token = "</python>"
        idx1 = result.index(start_token)
        idx2 = result.index(end_token)
        transformer_class = result[idx1 + len(start_token) + 1: idx2]
        print(transformer_class)

        transformer_class_bytes = transformer_class.encode("ascii")
        base64_bytes = base64.b64encode(transformer_class_bytes)
        base64_string = base64_bytes.decode("ascii")
        responses.append({
            'bucket': bucket,
            'key': key,
            'transformer': base64_string
        })

    notify("success", 2)
    return responses


# perform all the initialization we can outside the invocation flow for faster warm starts
llm, bedrock_embeddings = configure_langchain()
mapping_docs = load_mapping_docs()
vector_store = initialize_vector_store(mapping_docs, bedrock_embeddings)
