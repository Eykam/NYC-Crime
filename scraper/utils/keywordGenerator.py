import os
import json
from openai import OpenAI

API_KEY = os.getenv("OPENAI_KEY")
MODEL = os.getenv("OPENAI_MODEL")
MAX_TOKENS = os.getenv("OPENAI_MAX_TOKENS")


def get_GPT_client():
    client = OpenAI(api_key=API_KEY)
    return client

def get_prompt(sentence):
    system = "You are a linguist specializing in semantics and keyword extraction, especially trained on issues or crimes in the 5 bureas, or police or NYPD or court involvment in New York City."
    
    
    user = f"""
    Take this sentence:

    {sentence}

    After closely analyzing the sentence return a dictionary in format:

    {{ related: boolean , keywords: string[]}}

    Where related is whether the sentence is related to crime in New York City and keywords are the most relevant keywords extracted from the sentence. Keywords so be one word each.

    Only return the dictionary in json format.
    """
    
    return {"system" : system, "user" : user}


def get_keywords(client, sentence):
    prompt = get_prompt(sentence)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": prompt['system']},
            {"role": "user", "content": prompt['user']}
        ],
        response_format={ "type": "json_object" },
        temperature=0.2,
        max_tokens=MAX_TOKENS,
        frequency_penalty=0.0,
        

    )

    generated_response = response.choices[0].message.content
    generated_response = json.loads(generated_response)
    print("generate_response", generated_response, flush=True)
    
    if isinstance(generated_response, dict) and "related" in generated_response and "keywords" in generated_response:
        if isinstance(generated_response["related"], bool) and isinstance(generated_response["keywords"], list):
            return generated_response
        
    return None
    