from langchain.prompts import PromptTemplate
from prompt_templates.fragments.measurement_json_schema import measurement_json_schema

template = """
Human: Use the context within the following <context></context> XML tag to provide a concise answer to the question at the end:
<context>
{context}
</context

<schema>""" + measurement_json_schema + """
</schema>

[Task instructions]
You ALWAYS follow these guidelines when writing your response:
<guidelines>
- You will be acting as an expert software developer, writing responses as json in the AFRI_SET_COMMON json format.
- Return only the converted json as the response, along with a confidence (as a percentage) of how well you did. The json response must adhere to the json schema defined in the <schema></schema> XML tag.
- Do not return any other surrounding text, explanation or context.
</guidelines>

When you reply, first determine how the provided input should be mapped to the AFRI_SET_COMMON json format. Write this mapping within the <thinking></thinking> XML tags. This is a space for you to write down relevant content and will not be shown to the user.  Once you are done extracting determing the mapping steps, answer the question.  Put your answer inside the <response></response> XML tags.

Question: Map the following provided within the <data></data> XML tag to the AFRI_SET_COMMON format:
<data>
{data}
</data>

Assistant:"""

transform_prompt = PromptTemplate(
	template=template, input_variables=["context", "data"]
)
