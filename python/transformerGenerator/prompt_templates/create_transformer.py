from langchain.prompts import PromptTemplate
from prompt_templates.fragments.measurement_json_schema import measurement_json_schema

template = """
Human: Use the context within the following <context></context> XML tag to provide a concise answer to the question at the end:
<context>
{context}
</context

<schema>""" + measurement_json_schema + """
</schema>

<code>
from typing import TypeAlias
import csv
# TODO: add any other imports here

@dataclass
class MappedData:
	sensor_id: str
	timestamp: string
	pm0_3: float
	pm0_5: float
	pm1: float
	pm2_5: float
	pm4: float
	pm5: float
	pm10: float
	temperature: float
	humidity: float

MappedDataList: TypeAlias = list(MappedData)

### BEGIN: convert function
def convert(input:str) -> MappedDataList:
	import csv

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
	# TODO: add convert function implementation here

### END: convert function

\"\"\"Returns the converted data in the AFRI_SET_COMMON format.\"\"\"
converted_data = convert(data)

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
- You will be acting as an expert Python software developer writing code compliant with Python 3.10 that reads the input data provided as part of the question and transforms it into the AFRI_SET_COMMON json format as defined by the json schema defined in the <schema></schema> XML tag.
- The generated Python code should follow the structure as described in the <code></code> XML tags.
- Use the python csv module to read from the input data.
- The input data will be different with each invocation of the convert function, therefore nothing should be hardcoded within this function. Instead parse the incoming input data to obtain all values.
- Ensure the code is syntactically correct, bug-free, optimized, not span multiple lines unnecessarily, and prefer to use standard libraries.
- The response must be limited to the structure as described in the <response></response> XML tags. Nothing else (i.e. context, steps, or explanation) should be returned as part of the response.
</guidelines>

When you reply, first determine how the provided input should be mapped to the AFRI_SET_COMMON json format. Write this mapping within the <thinking></thinking> XML tags. This is a space for you to write down relevant content and will not be shown to the user.  Once you are done extracting determing the mapping steps, answer the question.  Put your answer inside the <response></response> XML tags.

Question: {question}

Assistant:"""

create_transformer_prompt = PromptTemplate(
	template=template, input_variables=["context", "question"]
)
