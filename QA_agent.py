from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
import os
from dotenv import load_dotenv
import asyncio
from autogen_core.models import ModelInfo
from autogen_core.memory import ListMemory, MemoryContent, MemoryMimeType

load_dotenv()
model_client = OpenAIChatCompletionClient(
    model="llama-3.3-70b-versatile",
    base_url="https://api.groq.com/openai/v1",
    model_info=ModelInfo(vision=True, function_calling=True, json_output=True, family="unknown", structured_output=True),
    api_key=os.getenv("GROQ_API_KEY"))

# Initialize memory for the agent
memory = ListMemory()

agent = AssistantAgent(
    name = 'QA_assistant',
    model_client=model_client,
    system_message="you are a helpful assistant and you specialize in answering the question which are related to coding you are a senior software engineer and are very good at solving coding related problems ",
    model_client_stream=True,
    memory=[memory]  # Add memory to the agent
)

async def assistant_run_stream() -> None:
    # Add the conversation to memory before processing
    task = "what was the best version of nodejs"
    
    await Console(
        agent.run_stream(task=task),
        output_stats=False,  # Enable stats printing.
    )
    await memory.add(MemoryContent(content=task, mime_type=MemoryMimeType.TEXT))
    
answer = asyncio.run(assistant_run_stream())