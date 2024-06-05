import { IonIcon } from "@ionic/react";
import { checkmarkOutline, createOutline } from "ionicons/icons";
import useChat, { useAuth, useSettings, useTheme, useRag} from "../../store/store";
import { motion } from "framer-motion";
import { useState } from "react";
import Modal from "../modals/Modal";
import ConfirmDelete from "../ConfirmDelete/ConfirmDelete";
import classNames from "classnames";
import config from '../../config/defaultSettings.json';
import fs from 'vite-plugin-fs/browser';

const varinats = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};



export default function SettingsTab({ visible }: { visible: boolean}) {
  const [sendChatHistory, setSendChatHistory] = useSettings((state) => [
    state.settings.sendChatHistory,
    state.setSendChatHistory,
  ]);
  const [translateChatMessage, setTranslateChatMessage] = useSettings((state) => [
    state.settings.translateChatMessage,
    state.setTranslateChatMessage,
  ]);
  const [theme, setTheme] = useTheme((state) => [state.theme, state.setTheme]);
  const [rag, setRag] = useRag((state) => [state.rag, state.setRag])
  const modalsList = useSettings((state) => state.settings.modalsList);
  const [setModal, selectedModal] = useSettings((state) => [
    state.setModal,
    state.settings.selectedModal,
  ]);
  const clearAllChats = useChat((state) => state.clearAllChats);
  const [apikey, setApiKey] = useAuth((state) => [
    state.apikey,
    state.setApiKey,
  ]); 
  const [apiUrl, setApiUrl] = useAuth((state) => [
    state.apiUrl,
    state.setApiUrl,
  ]); 
  const [translationApiUrl, setTranslationApiUrl] = useAuth((state) => [
    state.translationApiUrl,
    state.setTranslationApiUrl,
  ]); 
  const [ragApiUrl, setRagApiUrl] = useAuth((state) => [
    state.ragApiUrl,
    state.setRagApiUrl,
  ]); 
  const [newApiKey, setNewApiKey] = useState(apikey);
  const [editApiKey, setEditApiKey] = useState(false);
  const [newApiUrl, setNewApiUrl] = useState(apiUrl);
  const [editApiUrl, setEditApiUrl] = useState(false);
  const [newTranslationApiUrl, setNewTranslationApiUrl] = useState(translationApiUrl);
  const [editTranslationApiUrl, setEditTranslationApiUrl] = useState(false);
  const [newRagApiUrl, setNewRagApiUrl] = useState(ragApiUrl);
  const [editRagApiUrl, setEditRagApiUrl] = useState(false);
  const [confirmDeleteChats, setConfirmDeleteChats] = useState(false);
  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSendChatHistory(e.target.checked);
  }
  function handleOnChangeTr(e: React.ChangeEvent<HTMLInputElement>) {
    setTranslateChatMessage(e.target.checked);
  }

  function handleModalChange(value: string) {
    setModal(value);
  }

  function handleSetNewApiKey() {
    if (newApiKey.trim().length === 0) return;
    setApiKey(newApiKey);
    setEditApiKey(false);
  }
  function handleSetNewApiUrl() {
    if (newApiUrl.trim().length === 0) return;
    setApiUrl(newApiUrl);
    setEditApiUrl(false);
  }
  function handleSetNewTranslationApiUrl() {
    if (newTranslationApiUrl.trim().length === 0) return;
    setTranslationApiUrl(newTranslationApiUrl);
    setEditTranslationApiUrl(false);
  }
  function handleSetNewRagApiUrl() {
    if (newRagApiUrl.trim().length === 0) return;
    setRagApiUrl(newRagApiUrl);
    setEditRagApiUrl(false);
  }
  const defaultApiUrl = config.apiUrl; 
  const defaultTranslationApiUrl = config.translationApiUrl;
  const defaultRagApiUrl = config.ragApiUrl;
  var textDecoder = new TextDecoder();
  async function writeFile(addrs, path, data) {
    await fetch(`${addrs}/${path}?cmd=writeFile`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: typeof data === "string" ? data : textDecoder.decode(data)
    });
  }
  async function handleSaveSettings() {
    // Сохранение в config
    let tmpApiUrl = apiUrl;
    if (!tmpApiUrl.startsWith("http://") && !tmpApiUrl.startsWith("https://")) {
      tmpApiUrl = "http://" + tmpApiUrl;
    }
    let url = new URL(tmpApiUrl);
    tmpApiUrl = url.protocol + "//" + url.hostname + (url.port ? ':' + url.port : '');
    let tmpTranslationApiUrl = translationApiUrl;
    if (!tmpTranslationApiUrl.startsWith("http://") && !tmpTranslationApiUrl.startsWith("https://")) {
      tmpTranslationApiUrl = "http://" + tmpTranslationApiUrl;
    }
    let url2 = new URL(tmpTranslationApiUrl);
    tmpTranslationApiUrl = url2.protocol + "//" + url2.hostname + (url2.port ? ':' + url2.port : '');
    let tmpRagApiUrl = ragApiUrl;
    if (!tmpRagApiUrl.startsWith("http://") && !tmpRagApiUrl.startsWith("https://")) {
      tmpRagApiUrl = "http://" + tmpRagApiUrl;
    }
    let url3 = new URL(tmpRagApiUrl);
    tmpRagApiUrl = url3.protocol + "//" + url3.hostname + (url3.port ? ':' + url3.port : '');
    config.apiUrl = tmpApiUrl;
    config.translationApiUrl = tmpTranslationApiUrl;
    config.ragApiUrl = tmpRagApiUrl;
    // Сохранение файла   
    //fs.writeFile('../defaultSettings.json', JSON.stringify(config), err => {
     // if (err) {
     //   console.error(err);
      //}
    //});
    const port = window.location.port ? `:${window.location.port}` : '';

    var addrs = `${window.location.protocol}//${window.location.hostname}${port}`;
    try {
      await writeFile(addrs, '../src/config/defaultSettings.json', JSON.stringify(config));
      
    } catch(err) {
      console.error(err);
    }

}

async function initialWiki(){
  await fetch(ragApiUrl + '/index_wiki_with_docs', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => console.log(data.message))
  .catch(error => console.error(error));
}
  return (
    <motion.div
      variants={varinats}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={classNames("settings","tabs",{hidden: !visible})}
    >
    	
      <div className="p-2">
        <div className="flex items-center mb-4 justify-between border border-gray-200 rounded dark:border-gray-700 p-2">
          <label
            htmlFor="default-checkbox"
            className="ml-2  font-medium  dark:text-gray-300"
          >
            Включить перевод
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
          checked={translateChatMessage}
          className="sr-only peer"
          onChange={handleOnChangeTr}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="flex items-center mb-4 justify-between border border-gray-200 rounded dark:border-gray-700 p-2">
          <label
            htmlFor="default-checkbox"
            className="ml-2  font-medium  dark:text-gray-300"
          >
            Темная тема
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              checked={theme === "dark"}
              onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="flex items-center mb-4 justify-between border border-gray-200 rounded dark:border-gray-700 p-2">
          <span className="ml-2  font-medium  dark:text-gray-300">
            Очистить все чаты
          </span>
          <button
            type="button"
            className=" bg-red-700 text-white p-1 px-2 rounded"
            onClick={() => setConfirmDeleteChats(true)}
          >
            Очистить
          </button>
        </div>
        <div className="flex items-center mb-4 justify-between border border-gray-200 rounded dark:border-gray-700 p-2">
          <label
            htmlFor="default-checkbox"
            className="ml-2  font-medium  dark:text-gray-300"
          >
            Отправлять весь диалог
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              checked={sendChatHistory}
              className="sr-only peer"
              onChange={handleOnChange}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="flex items-center mb-4 justify-between border border-gray-200 rounded dark:border-gray-700 p-2">
          <label
            htmlFor="default-checkbox"
            className="ml-2  font-medium  dark:text-gray-300"
          >
            Включить Rag
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value= ""
              checked={rag === true}
              disabled
              aria-disabled="true"
  //            onChange={() => {
      //            setRag(rag === false ? true : true)
        //          localStorage.setItem('rag', rag)
        //        }
       //       }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div>
          <button
              type="button"
              className=" bg-teal-700 text-white p-1 px-2 rounded"
              onClick={initialWiki}
            >
            Индексировать Wiki
          </button>
        </div>
        		<div className="">
  <label className="font-medium dark:text-gray-300 mb-2">API URL</label>
  
  <input 
    type="text"
    value={apiUrl}
    onChange={(e) => setApiUrl(e.target.value)}
    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
   placeholder={defaultApiUrl}
  />
</div>

<div className="">
  <label className="font-medium dark:text-gray-300 mb-2">Translation API URL</label>

  <input
    type="text" 
    value={translationApiUrl}
    onChange={(e) => setTranslationApiUrl(e.target.value)}
    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    placeholder={defaultTranslationApiUrl}
  />  
</div>
<div className="">
  <label className="font-medium dark:text-gray-300 mb-2">Rag API URL</label>

  <input
    type="text" 
    value={ragApiUrl}
    onChange={(e) => setRagApiUrl(e.target.value)}
    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    placeholder={defaultRagApiUrl}
  />  
</div>
<div className="flex items-center mb-4 justify-between border-gray-200 rounded dark:border-gray-700 p-2">
          <span className="ml-2  font-medium  dark:text-gray-300">
            Сохранить настройки для всех
          </span>
          <button
            type="button"
            className=" bg-teal-700 text-white p-1 px-2 rounded"
            onClick={handleSaveSettings}
          >
            Сохранить на сервер
          </button>
        </div>
        <div className="">
          <label
            htmlFor="apikey"
            className="font-medium  dark:text-gray-300 mb-2"
          >
            Изменить ключ Api
          </label>
          <div className="flex items-center mb-4 justify-between border border-gray-200 rounded dark:border-gray-700 p-2">
            <input
              type={editApiKey ? "text" : "password"}
              id="apikey"
              value={newApiKey}
              readOnly={!editApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="sk-•••••••••••••••••••••••••••"
              required
            />
            {editApiKey ? (
              <button
                type="button"
                className="w-11 text-xl"
                onClick={handleSetNewApiKey}
              >
                <IonIcon icon={checkmarkOutline} />
              </button>
            ) : (
              <button
                type="button"
                className="w-11 text-xl"
                onClick={() => setEditApiKey(true)}
              >
                <IonIcon icon={createOutline} />
              </button>
            )}
          </div>
        </div>

        <div className="">
          <label
            htmlFor="countries"
            className="block mb-2 text-sm font-medium   dark:text-gray-300"
          >
            Выбрать модель
          </label>
          <select
            id="countries"
            defaultValue={selectedModal}
            onChange={(e) => handleModalChange(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {modalsList &&
              modalsList.map((modal) => (
                <option value={modal} key={modal}>
                  {modal}
                </option>
              ))}
          </select>
        </div>
      </div>
      <Modal visible={confirmDeleteChats}>
        <ConfirmDelete
          onDelete={() => {
            clearAllChats();
            setConfirmDeleteChats(false);
          }}
          onCancel={() => setConfirmDeleteChats(false)}
        >
          <p className="text-gray-500 dark:text-gray-700">
            This will delete all your chats and messages. This action cannot be
            undone.
          </p>
        </ConfirmDelete>
      </Modal>
    </motion.div>
  );
}
