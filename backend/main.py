import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from duckduckgo_search import DDGS

# Load environment variables
load_dotenv()

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("Warning: OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=api_key)

app = FastAPI()

# Data model for chat request
class ChatRequest(BaseModel):
    message: str

# Define Tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the internet for up-to-date information, news, or facts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to send to the search engine.",
                    }
                },
                "required": ["query"],
            },
        },
    }
]

def search_web(query: str) -> str:
    """Performs a DuckDuckGo search and returns the top results."""
    print(f"Searching web for: {query}")
    try:
        results = DDGS().text(query, max_results=5)
        if not results:
            return "No results found."
        return json.dumps(results)
    except Exception as e:
        return f"Search failed: {str(e)}"

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        messages = [
            {"role": "system", "content": "You are Sid's Chatbot, a helpful and intelligent AI. You have access to a web search tool. Use it whenever a user asks about current events, facts, or information you might not know. Always cite your sources if you use search results."},
            {"role": "user", "content": request.message}
        ]

        # First call to model
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        # Check if model wants to call a tool
        if tool_calls:
            messages.append(response_message)  # extend conversation with assistant's reply

            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                if function_name == "search_web":
                    function_response = search_web(
                        query=function_args.get("query")
                    )
                    
                    messages.append(
                        {
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": function_response,
                        }
                    )

            # Second call to model (with tool outputs)
            second_response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages
            )
            return {"response": second_response.choices[0].message.content}

        # If no tool call, just return the response
        return {"response": response_message.content}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount the frontend directory to serve static files
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
