import os
from langchain.embeddings import BedrockEmbeddings
from langchain.llms.bedrock import Bedrock
from utils import bedrock
from langchain.document_loaders import DirectoryLoader
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from prompt_templates.create_transformer import create_transformer_prompt
from prompt_templates.transform import transform_prompt

import logging
logger = logging.getLogger()

# clients
bedrock_client = bedrock.get_bedrock_client(
    region=os.environ.get("AWS_DEFAULT_REGION", None)
)
s3_client = boto3.client('s3')

def configure_langchain():
    llm = Bedrock(model_id="anthropic.claude-v2:1", client=bedrock_client, model_kwargs={'max_tokens_to_sample':5000})
    bedrock_embeddings = BedrockEmbeddings(model_id="amazon.titan-embed-text-v1", client=bedrock_client)
    return (llm, bedrock_embeddings)

def load_mapping_docs():
    loader = DirectoryLoader('./mappings', glob="**/*.md")
    docs = loader.load()
    avg_doc_length = lambda documents: sum([len(doc.page_content) for doc in docs])//len(docs)
    avg_char_count = avg_doc_length(docs)
    logger.debug(f'Average length among {len(docs)} documents loaded is {avg_char_count} characters.')
    return docs

def initialize_vector_store(docs, embeddings):
    vs = FAISS.from_documents(
        docs,
        embeddings,
    )
    return vs

def execute(prompt, data) :
    qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vector_store.as_retriever(
            search_type="similarity", search_kwargs={"k": 3}
            # search_type="similarity_score_threshold", search_kwargs={"score_threshold": .9}
        ),
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt}
    )
    answer = qa({"data": data})
    logger.debug(answer['result'])
    return answer

def lambda_handler(event, context):

    try:
        data : str = event['data']
    except (KeyError, IndexError):
        logger.error("Missing `data` parameter(s) in event.")
        exit

    mode : str = event['mode']	# `TRANSFORM` or `TRANSFORMER`
    if mode == None:
        mode = "TRANSFORM"

    # have the LLM create the transformer
    prompt = create_transformer_prompt if mode=="TRANSFORMER" else transform_prompt
    answer = execute(prompt, data)
    return answer


# perform all the initialization we can outside the invocation flow for faster warm starts
llm, bedrock_embeddings = configure_langchain()
mapping_docs = load_mapping_docs()
vector_store = initialize_vector_store(mapping_docs, bedrock_embeddings)
