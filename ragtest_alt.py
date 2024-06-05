# -*- coding: utf-8 -*-
# import
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, get_response_synthesizer
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.readers.web import SimpleWebPageReader
from llama_index.core import StorageContext, PromptTemplate
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.llms.openai import OpenAI
from llama_index.core import Settings
import chromadb
from chromadb.config import Settings as cSettings
from tqdm import tqdm
from transformers import AutoTokenizer
from CustomWikiReader import CustomWikiReader
import time

import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

apiSettings = {}
# set up OpenAI
import os
import getpass

def load_settings():
    global apiSettings
    with open("./src/config/defaultSettings.json", "r") as f:
        apiSettings = json.load(f)
        print("Настройки обновлены1")

def update_llm_settings():
    load_settings()
    os.environ["OPENAI_BASE"] = apiSettings["apiUrl"]

class SettingsChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("./src/config/defaultSettings.json"):
            print("Файл настроек изменен. Ожидание 2 секунды перед обновлением...")
            time.sleep(2)  # Задержка в 2 секунды
            print("Обновление настроек")
            load_settings()
            update_llm_settings()


event_handler = SettingsChangeHandler()
observer = Observer()
observer.schedule(event_handler, path="./src/config/", recursive=False)
observer.start()

load_settings()
os.environ["OPENAI_BASE"] = apiSettings["apiUrl"]

#Settings.llm = OpenAI(api_base=os.environ.get("OPENAI_BASE") +"/v1", api_key="11111", timeout=999999)
Settings.chunk_size=512 # Number of tokens in each chunk
Settings.chunk_overlap=0.2


WikiReader = CustomWikiReader(
    sitemap_index_url="https://wiki.extyl-pro.ru/sitemap/sitemap-index-wiki.extyl-pro.ru.xml",
    auth_url="https://wiki.extyl-pro.ru/auth2.php",
    login="test-mail@extyl-pro.ru",
    password="slkd3***Jife"
)

# load documents
#documents = SimpleDirectoryReader("d:/_WORK/ElPixel/RAG/text_ru/").load_data()
# documents = WikiReader.load_data()


print("reading docs")

# define embedding function
#embed_model = HuggingFaceEmbedding(model_name="hivaze/ru-e5-base")
embed_model = HuggingFaceEmbedding(model_name="intfloat/multilingual-e5-small")

# save to disk
print("saving docs")
db = chromadb.PersistentClient(path="./chroma_db", settings=cSettings(allow_reset=True))
chroma_collection = db.get_or_create_collection("quickstart")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# load from disk
print("loading docs")
db2 = chromadb.PersistentClient(path="./chroma_db", settings=cSettings(allow_reset=True))
chroma_collection = db2.get_or_create_collection("quickstart")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
index = VectorStoreIndex.from_vector_store(
    vector_store,
    embed_model=embed_model, show_progress=True
)

text_qa_template_str0 = (
    "Ты - лучшая справочная ситема. "
    "Твоя задача - процитировать полученный контекст справочной информации пользователю. "
    "Найденный контекст для ответа приведен"
    " ниже.\n---------------------\n{context_str}\n---------------------\n"
    " Процитируй на русском языке"
    " полученный контекст\n."
)
text_qa_template0 = PromptTemplate(text_qa_template_str0)

text_qa_template_str = (
    "Ты - лучшая экспертная система вопросов и ответов. "
    "Всегда отвечайте на запрос, используя только предоставленную "
    "контекстную информацию, старайся избегать применения"
    " собственных знаний без необходимости. Некоторые правила, которым нужно следовать:\n"
    "1. Никогда не ссылайтесь напрямую на контекст в своем ответе.\n"
    "2. Используй в ответе только информацию из предоставленного контекста и её интерпритацию.\n"
    "Контекст для ответа приведен"
    " ниже.\n---------------------\n{context_str}\n---------------------\nИспользуя"
    " информацию из контекста и свои знания, ответь на русском языке"
    " на вопрос: {query_str}\n."
)
text_qa_template = PromptTemplate(text_qa_template_str)

refine_template_str = (
    "Исходный вопрос таков: {query_str}\nМы получили вот такой"
    " ответ: {existing_answer}\nЕсть возможность дополнить и расширить"
    " существующий ответ на основен контекста"
    " ниже если ответ недостаточно полный.\n------------\n{context_msg}\n------------\nИспользуя новый контекст "
    "дополни и расширь ответ на русском языке, либо верни исходный ответ если дополнить нечем.\n"
    "Старайся сохранить максимум полезного контента из исходного ответа!!\n"
)
refine_template = PromptTemplate(refine_template_str)

retriever0 = VectorIndexRetriever(
        index=index,
        similarity_top_k=1,
    )
retriever = VectorIndexRetriever(
        index=index,
        similarity_top_k=4,
    )

def query_processing0(query):
    retriever0in = VectorIndexRetriever(
        index=index,
        similarity_top_k=1,
    )
    response_synthesizer0 = get_response_synthesizer(llm=OpenAI(api_base=os.environ.get("OPENAI_BASE") +"/v1", api_key="11111", timeout=999999), text_qa_template=text_qa_template0, refine_template=refine_template, summary_template=text_qa_template, response_mode="refine")
    query_engine0 = RetrieverQueryEngine(
        retriever=retriever0in,
        response_synthesizer=response_synthesizer0,
        node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.7)],
    )
    responce0 = query_engine0.query(query)
    return responce0

def query_processing(query):
    retriever1in = VectorIndexRetriever(
        index=index,
        similarity_top_k=4,
    )
    response_synthesizer = get_response_synthesizer(llm=OpenAI(api_base=os.environ.get("OPENAI_BASE") +"/v1", api_key="11111", timeout=999999), text_qa_template=text_qa_template, refine_template=refine_template, summary_template=text_qa_template, response_mode="refine")
    query_engine = RetrieverQueryEngine(
        retriever=retriever1in,
        response_synthesizer=response_synthesizer,
        node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.7)],
    )
    responce = query_engine.query(query)
    return responce

def index_files(folder_path):
    try:
        chroma_collection.delete(chroma_collection.get()["ids"])
    except Exception as e:
        pass
    documents = SimpleDirectoryReader(folder_path).load_data()
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=embed_model, show_progress=True)
    retriever.index = index
    update_index_from_vector_store()

def index_urls(urls):
    documents = SimpleWebPageReader().load_data(urls)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=embed_model, show_progress=True)
    retriever.index = index
    update_index_from_vector_store()

def index_wiki():
    try:
        chroma_collection.delete(chroma_collection.get()["ids"])
    except Exception as e:
        pass
    documents = WikiReader.load_data()
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=embed_model, show_progress=True)
    retriever.index = index
    update_index_from_vector_store()
    
def index_wiki_with_docs():
    try:
        chroma_collection.delete(chroma_collection.get()["ids"])
    except Exception as e:
        pass
    documents_urls = WikiReader.load_data()
    print("indexing wiki data")
    index = VectorStoreIndex.from_documents(documents_urls, storage_context=storage_context, embed_model=embed_model, show_progress=True)
    print("loading wiki docs")
    documents_docs = SimpleDirectoryReader("./extyl-docs").load_data()
    print("indexing docs data")
    index = VectorStoreIndex.from_documents(documents_docs, storage_context=storage_context, embed_model=embed_model, show_progress=True)
    print("update retrievers")
    retriever.index = index
    retriever0.index = index
    print("update index from vector store")
    update_index_from_vector_store()

def update_index_from_vector_store():
    db = chromadb.PersistentClient(path="./chroma_db", settings=cSettings(allow_reset=True))
    chroma_collection = db.get_or_create_collection("quickstart")
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    retriever.index = VectorStoreIndex.from_vector_store(
        vector_store,
        embed_model=embed_model,
        show_progress=True
    )


if __name__ == "__main__":
    # Код для локального запуска и тестирования
    print("get from llm")
    response = query_engine.query("Who is Black Swan and how she meets Sparkle on Penacony?")
    print(response)