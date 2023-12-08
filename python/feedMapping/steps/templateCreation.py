# Note : this is a copy paste of our notebook and needs to be updated to produce a template from the input

import warnings
warnings.filterwarnings('ignore')
import json
import os
import sys
import boto3

module_path = ".."
sys.path.append(os.path.abspath(module_path))
from utils import bedrock, print_ww

boto3_bedrock = bedrock.get_bedrock_client(
    #assumed_role=os.environ.get("BEDROCK_ASSUME_ROLE", None),
    region=os.environ.get("AWS_DEFAULT_REGION", None)
)

#We need to add the embeddings of our known mappings to the Vector store. The Claude 2.1 FM has a large 200k token input limit therefore we don't need to worry about splitting the templates into smaller chunks to fit.

from langchain.embeddings import BedrockEmbeddings
from langchain.llms.bedrock import Bedrock


llm = Bedrock(model_id="anthropic.claude-v2:1", client=boto3_bedrock, model_kwargs={'max_tokens_to_sample':5000})
bedrock_embeddings = BedrockEmbeddings(model_id="amazon.titan-embed-text-v1", client=boto3_bedrock)

from langchain.document_loaders import DirectoryLoader

loader = DirectoryLoader('./mappings', glob="**/*.md", show_progress=True)
docs = loader.load()

avg_doc_length = lambda documents: sum([len(doc.page_content) for doc in docs])//len(docs)
avg_char_count = avg_doc_length(docs)
print(f'Average length among {len(docs)} documents loaded is {avg_char_count} characters.')


#Sample the embeddings for one of the mappings.
import numpy as np

sample_embedding = np.array(bedrock_embeddings.embed_query(docs[0].page_content))
# print("Sample embedding of a document chunk: ", sample_embedding)
# print("Size of the embedding: ", sample_embedding.shape)


#As this is a quick prototype, use FAISS (in-memory vector store) within LangChain. But use OpenSearch Serverless for the hackathon.

from langchain.chains.question_answering import load_qa_chain
from langchain.vectorstores import FAISS
from langchain.indexes import VectorstoreIndexCreator
from langchain.indexes.vectorstore import VectorStoreIndexWrapper

vectorstore_faiss = FAISS.from_documents(
    docs,
    bedrock_embeddings,
)

wrapper_store_faiss = VectorStoreIndexWrapper(vectorstore=vectorstore_faiss)

## Obtain the mapped result

import pprint

def execute(prompt, query, expected) :
    qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore_faiss.as_retriever(
            search_type="similarity", search_kwargs={"k": 3}
        ),
        # return_source_documents=True,
        chain_type_kwargs={"prompt": prompt}
    )
    answer = qa({"query": query})

    if expected != '?':
        print("Expected: \n", expected)
        print("\nActual: \n", answer['result'])
    else:
        print("Result: \n",answer['result'])
    
    # print("\tquery: \n", answer['query'])
    # print("\tsource_documents: \n", answer['source_documents'])

##Now that we have our vector store in place, we can start asking questions. Let's define a reusable template.

from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
prompt_template = """

Human: Use the following pieces of context to provide a concise answer to the question at the end. 
<context>
{context}
</context

Return only the converted json as the response, along with a confidence (as a percentage) of how well you did. The json must adhere to the AFRI_SET_COMMON format.
Do not return any other surrounding text, explanation or context.

Question: {question}

Assistant:"""

PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)

query_1 = """Map the following provided data to the common data formmat:
locationId,locationName,pm01,pm02,pm10,pm003Count,atmp,rhum,rco2,tvoc,wifi,timestamp,serialno,firmwareVersion,tvocIndex,noxIndex,datapoints
59513,dc5475b0f97c,15.6,26.400002,27.3,2994.5,25.3,70.8,,,-69,2023-11-12T01:20:00.000Z,dc5475b0f97c,,,,2
59513,dc5475b0f97d,10.65,18.349998,18.75,2125.5,24.6,73.75,,,-68.5,2023-11-12T02:35:00.000Z,dc5475b0f97c,,,,2
"""

# this is just used for testing. The model never sees this
expected_1 = [{
    'sensorId': "dc5475b0f97c",
    'timestamp': "2023-11-12T01:20:00.000Z",
    'pm1': 15.6,
    'pm2.5': 26.400002,
    'pm10': 27.3,
    'temperature': 25.3,
    'humidity': 70.8
},{
    'sensorId': "dc5475b0f97d",
    'timestamp': "2023-11-12T02:35:00.000Z",
    'pm1': 10.65,
    'pm2.5': 18.349998,
    'pm10': 18.75,
    'temperature': 24.6,
    'humidity': 73.75
}]

# This is an example from airbeam.csv

query_2 = """Map the following provided data to the common data formmat:
,,,,,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name
,,,,,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc
,,,,,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name
,,,,,AirBeam3-F,AirBeam3-PM1,AirBeam3-PM10,AirBeam3-PM2.5,AirBeam3-RH
,,,,,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type
,,,,,Temperature,Particulate Matter,Particulate Matter,Particulate Matter,Humidity
,,,,,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units
,,,,,fahrenheit,microgram per cubic meter,microgram per cubic meter,microgram per cubic meter,percent
ObjectID,Session_Name,Timestamp,Latitude,Longitude,1:Measurement_Value,2:Measurement_Value,3:Measurement_Value,4:Measurement_Value,5:Measurement_Value
421,AfriSET (1),2023-10-06T21:55:17.000,5.65151,-0.185649,90.0,7.0,8.0,8.5,69.0
20,AfriSET (1),2023-10-06T15:13:20.000,5.65151,-0.185649,100.0,5.0,6.0,7.0,37.0
"""

# this is just used for testing. The model never sees this
expected_2 = [{
    'sensorId': "AirBeam3-943cc67daabc",
    'timestamp': "2023-10-06T21:55:17.000",
    'pm1': 7.0,
    'pm2.5': 8.5,
    'pm10': 8.0,
    'temperature': 90.0,
    'humidity': 69.0
}, {
    'sensorId': "AirBeam3-943cc67daabc",
    'timestamp': "2023-10-06T15:13:20.000",
    'pm1': 5.0,
    'pm2.5': 7.0,
    'pm10': 6.0,
    'temperature': 100.0,
    'humidity': 37.0
}]

query_embedding_1 = vectorstore_faiss.embedding_function(query_1)

query_embedding_2 = vectorstore_faiss.embedding_function(query_2)

## We can use this embedding of the query to then fetch relevant documents. Now our query is represented as embeddings we can do a similarity search of our query against our data store providing us with the most relevant information.

def get_relevant_documents(embedding):
    relevant_documents = vectorstore_faiss.similarity_search_by_vector(embedding)
    print(f'{len(relevant_documents)} documents are fetched which are relevant to the query.')
    # print('----')
    # for i, rel_doc in enumerate(relevant_documents):
    #     print_ww(f'## Document {i+1}: {rel_doc.page_content}.......')
    #     print('---')
    return relevant_documents

relevant_documents_1 = get_relevant_documents(query_embedding_1)
relevant_documents_2 = get_relevant_documents(query_embedding_2)

execute(PROMPT, query_1, expected_1)


## How to map

from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

mapping_prompt_template = """

Human: Use the context within the following <context></context> XML tag to provide a concise answer to the question at the end:
<context>
{context}
</context

<code>
from datetime import datetime
from typing import TypeAlias
import csv
# TODO: add any other imports here

@dataclass
class MappedData:
    sensor_id: str
    timestamp: datetime 
    pm1: float  
    pm25: float
    pm10: float
    temperature: float
    humidity: float

MappedDataList: TypeAlias = list(MappedData)

class Converter:
    \"\"\"A class that manages the conversion of a provided set of data, either in json or csv, to the AFRI_SET_COMMON format.
    \"\"\"
    
    def convert(input:str) -> MappedDataList:
        \"\"\"Converts the provided data to the AFRI_SET_COMMON format.

        Parameters
        ----------
        input : str
           Input data to be converted to the AFRI_SET_COMMON format.

        Returns
        -------
        MappedDataList
            A list of line items from the incoming data converted to the AFRI_SET_COMMON format.
        \"\"\"
        # TODO: add implementation here  
</code>

<response>
    <python>
        <!--insert generated python class here -->
    </python>
    <confidence>
        <!--insert confidence rate of transform here -->
    </confidence>
    <test>
        <!--insert executable python code here to test, which must pass -->
    </test>
</response>

[Task instructions]
You ALWAYS follow these guidelines when writing your response:
<guidelines>
- You will be acting as an expert software developer in Python. 
- Write code compliant with Python 3.10 that reads the data provided as part of the question and maps it to the AFRI_SET_COMMON json format. The code should follow the structure as described in the <code></code> XML tags. 
- Use the python csv module to read and process any provided input data.
- No values within the convert method should be hard-coded strings or numbers. All values in the input data are dynamic therefore must be sourced directly from the provided input data.
- Ensure the code is syntactically correct, bug-free, optimized, not span multiple lines unnessarily, and prefer to use standard libraries. 
- The response must be limited to the structure as described in the <response></response> XML tags. Nothing else (i.e. context, steps, or explanation) should be returned as part of the response.
</guidelines>

When you reply, first determine how the provided input should be mapped to the AFRI_SET_COMMON json format. Write this mapping within the <thinking></thinking> XML tags. This is a space for you to write down relevant content and will not be shown to the user.  Once you are done extracting determing the mapping steps, answer the question.  Put your answer inside the <response></response> XML tags.

Question: {question}

Assistant:"""

MAPPING_PROMPT = PromptTemplate(
    template=mapping_prompt_template, input_variables=["context", "question"]
)

## Create the embeddings.

print("Create the embeddings Start !!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

mapping_query_embedding_1 = vectorstore_faiss.embedding_function(query_1)
mapping_relevant_documents_1 = get_relevant_documents(mapping_query_embedding_1)

mapping_query_embedding_2 = vectorstore_faiss.embedding_function(query_2)
mapping_relevant_documents_2 = get_relevant_documents(mapping_query_embedding_2)

execute(MAPPING_PROMPT, query_1, '?')

execute(MAPPING_PROMPT, query_2, '?')