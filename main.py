# -*- coding: utf-8 -*-
from fastapi import FastAPI, Query, UploadFile, File, Form
from pydantic import BaseModel
from typing import List
from ragtest_alt import query_processing, query_processing0, index_files, index_urls, index_wiki, index_wiki_with_docs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Disable CORS globally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
def get_query_response(request: QueryRequest):
    query = request.query
    response0 = query_processing0(query)
    refined_query = query + "\n Имеющиеся данные по вопросу: " + str(response0)
    response = query_processing(refined_query)
    return {"result": response}
    
@app.post("/simplequery")
def get_query_response(request: QueryRequest):
    query = request.query
    response = query_processing(query)
    return {"result": response}


@app.post("/index_files")
def index_files_endpoint(folder_path: str = Form(...)):
    index_files(folder_path)
    return {"message": "Files indexed successfully"}

@app.post("/index_wiki_with_docs")
def index_wiki_endpoint():
    index_wiki_with_docs()
    return {"message": "Wiki indexed successfully"}
    
@app.post("/index_wiki")
def index_wiki_endpoint():
    index_wiki()
    return {"message": "Wiki indexed successfully"}

@app.post("/index_urls")
def index_urls_endpoint(urls: List[str] = Form(...)):
    index_urls(urls)
    return {"message": "URLs indexed successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=18000)