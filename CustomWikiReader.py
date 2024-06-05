import gzip
import os
import urllib.request
import shutil
from urllib.parse import urljoin, urlparse, quote
from xml.etree import ElementTree as ET
import requests
from bs4 import BeautifulSoup
from typing import List
from llama_index.core.schema import Document
from tqdm import tqdm
from urllib.parse import unquote
from concurrent.futures import ThreadPoolExecutor, as_completed

def remove_extyl_docs_folder():
    extyl_docs_folder = 'extyl-docs'
    if os.path.exists(extyl_docs_folder):
        try:
            shutil.rmtree(extyl_docs_folder)
            print(f"Папка {extyl_docs_folder} успешно удалена.")
        except Exception as e:
            print(f"Не удалось удалить папку {extyl_docs_folder}: {e}")

class CustomWikiReader:
    def __init__(self, sitemap_index_url: str, auth_url: str, login: str, password: str):
        self.sitemap_index_url = sitemap_index_url
        self.auth_url = auth_url
        self.login = login
        self.password = password
        self.session = None

    def get_content(self, url):
        response = urllib.request.urlopen(url)
        content = response.read()
        return content

    def extract_urls(self, xml_content):
        root = ET.fromstring(xml_content)
        urls = []
        for url_elem in root.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url'):
            loc_elem = url_elem.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
            if loc_elem is not None:
                urls.append(loc_elem.text)
        return urls

    def extract_all_urls(self):
        all_urls = []
        sitemap_index_content = self.get_content(self.sitemap_index_url).decode('utf-8')
        root = ET.fromstring(sitemap_index_content)
        for sitemap_elem in root.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}sitemap'):
            loc_elem = sitemap_elem.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
            if loc_elem is not None:
                sitemap_url = loc_elem.text
                sitemap_content = self.get_content(sitemap_url)
                try:
                    sitemap_content = gzip.decompress(sitemap_content).decode('utf-8')
                except gzip.BadGzipFile:
                    sitemap_content = sitemap_content.decode('utf-8')
                urls = self.extract_urls(sitemap_content)
                all_urls.extend(urls)
        return all_urls

    def authenticate(self):
        session = requests.Session()
        response = session.get(self.auth_url)
        soup = BeautifulSoup(response.text, "html.parser")

        phpsessid = response.cookies.get("PHPSESSID")
        backurl = soup.find("input", {"name": "backurl"}).get("value")

        login_url = f"{self.auth_url}?login=yes"
        data = {
            "AUTH_FORM": "Y",
            "TYPE": "AUTH",
            "backurl": backurl,
            "USER_LOGIN": self.login,
            "USER_PASSWORD": self.password,
            "Login": "Войти"
        }
        headers = {
            "Referer": self.auth_url,
            "Cookie": f"PHPSESSID={phpsessid}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        response = session.post(login_url, data=data, headers=headers)

        if response.url == "https://wiki.extyl-pro.ru/index.php?title=%D0%97%D0%B0%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0":
            print("Авторизация прошла успешно!")
            self.session = session
        else:
            print("Ошибка авторизации")

    def parse_page(self, url):
        if "/wiki/index.php/" in url:
            url_parts = url.split("/wiki/index.php/")
            base_url = url_parts[0] + "/index.php"
            title = url_parts[1]
            query = "title=" + title
            url = f"{base_url}?{query}"

        response = self.session.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")

            heading = soup.find("h1", {"id": "firstHeading", "class": "firstHeading", "lang": "ru"})
            heading_text = heading.text if heading else ""

            content_div = soup.find("div", {"id": "mw-content-text", "lang": "ru", "dir": "ltr", "class": "mw-content-ltr"})
            content_text = content_div.text if content_div else ""

            content_text = "\n".join(line.strip() for line in content_text.split("\n") if line.strip())
            # Проверяем наличие ссылок на файлы
            download_links = soup.select('span.dangerousLink a')
            if download_links:
                for link in download_links:
                    file_url = urljoin(url, link['href'])
                    file_name = os.path.basename(file_url)
                    file_ext = os.path.splitext(file_name)[1].lower()
                    if file_ext in ['.doc', '.docx', '.csv', '.txt']:
                        # Декодируем имя файла
                        decoded_file_name = unquote(file_name)
                        file_path = os.path.join('extyl-docs', decoded_file_name).replace('\\', '/')
                        with open(file_path, 'wb') as f:
                            f.write(requests.get(file_url).content)
                        print(f"Файл {decoded_file_name} успешно скачан.")
            
            if content_text:
                #return Document(source_uri=url, metadata={"source_uri": url}, text=f"{heading_text}\n\n{content_text}") 
                return Document(source_uri=url, text=f"{heading_text}\n\n{content_text}")              
        else:
            print(f"Failed to fetch: {url}")

    def parse_page_wrapper(self, url):
        try:
            return self.parse_page(url)
        except Exception as e:
            print(f"Failed to fetch: {url}, error: {e}")
            return None

    # def load_data(self) -> List[Document]:
    #     if not self.session:
    #         self.authenticate()

    #     all_urls = self.extract_all_urls()
    #     documents = []
    #     for url in tqdm(all_urls, desc="Получение документов", unit="документ"):
    #         doc = self.parse_page(url)
    #         if doc:
    #             documents.append(doc)
    #     return documents
    def load_data(self) -> List[Document]:
        if not self.session:
            self.authenticate()
            
        # Удаляем старую папку extyl-docs, если она существует
        remove_extyl_docs_folder()
        
        if not os.path.exists('extyl-docs'):
            os.makedirs('extyl-docs')

        all_urls = self.extract_all_urls()
        documents = []
        merged_doc = ""
        merged_urls = []
        
        with ThreadPoolExecutor(max_workers=7) as executor:
            futures = [executor.submit(self.parse_page_wrapper, url) for url in all_urls]
            for future in tqdm(as_completed(futures), total=len(futures), desc="Получение документов", unit=" docs"):
                try:
                    doc = future.result()
                    if doc:
                        doc_lines = doc.text.strip().split("\n")
                        non_empty_lines = [line for line in doc_lines if line.strip()]
                        if len(non_empty_lines) >= 8:
                            documents.append(doc)
                        else:
                            try:
                                merged_doc += doc.text + "\n\n"
                            except Exception as e:
                                print(f"Ошибка при получении doc.text: {e}")
                            try:
                                #merged_urls.append(doc.metadata["source_uri"])
                                merged_urls.append(doc.source_uri)
                            except Exception as e:
                                pass
                except Exception as e:
                    print(f"Ошибка при получении документа: {e}")

        if merged_doc:
            #documents.append(Document(metadata={"source_uri": ", ".join(merged_urls)}, text=merged_doc.strip()))
            documents.append(Document(source_uri=", ".join(merged_urls), text=merged_doc.strip()))

        return documents