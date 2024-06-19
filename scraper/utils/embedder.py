import re
from transformers import AutoTokenizer, AutoModel

# Use BERT for sentence embeddings
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")


def create_embedder():
  tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
  model = AutoModel.from_pretrained("bert-base-uncased")
  return {"tokenizer" : tokenizer, "model":model}

def embed_keywords(embedder, client, keywords):
    tokenizer = embedder['tokenizer']
    model = embedder['model']
    
    # Embed keywords and store in Redis HSET
    for keyword in keywords:
        if tokenizer and model:
            keyword = keyword.lower()
            subwords = re.split(r'[^a-zA-Z0-9]+(?=[:])|[^a-zA-Z0-9]+', keyword)
            
            for word in subwords:
                vector  = model(**tokenizer(word, return_tensors="pt")).last_hidden_state[0][0].detach().numpy()

                # Store the keyword and its vector in the Redis HSET
                client.hset("embeddings", keyword, str(vector))
        else:
            print("failed to tokenize")
            print("model", model)
            print("tokenizer", tokenizer)

    print("Embeddings have been stored in Redis HSET 'embeddings'.")