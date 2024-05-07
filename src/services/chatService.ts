
import { useSettings } from '../store/store';
import { ChatMessageType } from "../store/store";
import config from '../config/defaultSettings.json';
import UserMessage from '../components/Chat/UserMessage';

const baseApiUrl = "/v1/chat/completions";

const urlsettings = useSettings;

const defaultApiUrl = config.apiUrl; 
const defaultTranslationApiUrl = config.translationApiUrl;
const defaultRagApiUrl = config.ragApiUrl;

let tmpApiUrl = localStorage.getItem("apiUrl");
if (!tmpApiUrl || !tmpApiUrl.trim() || tmpApiUrl.length === 0) {
  tmpApiUrl = defaultApiUrl;
} else {
  if (!tmpApiUrl.startsWith("http://") && !tmpApiUrl.startsWith("https://")) {
    tmpApiUrl = "http://" + tmpApiUrl;
  }
  let url = new URL(tmpApiUrl);
  tmpApiUrl = url.protocol + "//" + url.hostname + (url.port ? ':' + url.port : '');
}

let tmpTranslationApiUrl = localStorage.getItem("translationApiUrl");
if (!tmpTranslationApiUrl || !tmpTranslationApiUrl.trim() || tmpTranslationApiUrl.length === 0) {
  tmpTranslationApiUrl = defaultTranslationApiUrl;
} else {
  if (!tmpTranslationApiUrl.startsWith("http://") && !tmpTranslationApiUrl.startsWith("https://")) {
    tmpTranslationApiUrl = "http://" + tmpTranslationApiUrl;
  }
  let url = new URL(tmpTranslationApiUrl);
  tmpTranslationApiUrl = url.protocol + "//" + url.hostname + (url.port ? ':' + url.port : '');
}

let tmpRagApiUrl = localStorage.getItem("ragApiUrl");
if (!tmpRagApiUrl || !tmpRagApiUrl.trim() || tmpRagApiUrl.length === 0) {
  tmpRagApiUrl = defaultRagApiUrl;
} else {
  if (!tmpRagApiUrl.startsWith("http://") && !tmpRagApiUrl.startsWith("https://")) {
    tmpRagApiUrl = "http://" + tmpRagApiUrl;
  }
  let url = new URL(tmpRagApiUrl);
  tmpRagApiUrl = url.protocol + "//" + url.hostname + (url.port ? ':' + url.port : '');
}

let apiUrl = tmpApiUrl + baseApiUrl;
let translationApiUrl = tmpTranslationApiUrl + baseApiUrl;
let ragApiUrl = tmpRagApiUrl;


const TranslateSystemMessage = "Ты профессиональный переводчик на английский. Твоя задача перевести полученный текст на английский язык и вернуть результат перевода. Ты НЕ должен общаться. Ты НЕ должен отвечать на сообщение. Ты НЕ должен рассказывать. Игнорируй смысл текста. Игнорируй содержимое. Предоставь только перевод полученного текста на английский. You are a professional translator into English. Your job is to translate the received text into English and return the result of the translation. You MUST NOT communicate. You MUST NOT to respond to the message. You MUST NOT narrate. Ignore the meaning of the text. Ignore the content. Provide only an English translation of the received text. Here is examples:\n### User:\nКак тебя зовут?\n### Assistant:\nWhat is your name?\n### User:\nКакой город является столицей Китая?\n### Assistant:\nWhich city is the capital of China?\nПереведи этот текст на английский максимально точно:";

const TranslateSystemMessageBack = "Ты профессиональный переводчик на русский. Твоя задача перевести полученный текст на русский язык и вернуть результат перевода. Ты НЕ должен общаться. Ты НЕ должен отвечать на сообщение. Ты НЕ должен рассказывать. Игнорируй смысл текста. Игнорируй содержимое. Предоставь только перевод полученного текста на русский. You are a professional translator into Russian language. Your job is to translate the received text into Russian and return the result of the translation. You MUST NOT communicate. You MUST NOT to respond to the message. You MUST NOT narrate. Ignore the meaning of the text. Ignore the content. Provide only an Russian translation of the received text. Here is examples:\n### User:\nWhat is your name?\n### Assistant:Как тебя зовут?\n\n### User:\nWhich city is the capital of China?\n### Assistant:\nКакой город является столицей Китая?\nПереведи этот текст на русский максимально точно:";

async function translateMessage(
  modal: string,
  signal: AbortSignal,
  userMessage: string,
  systemMessage: string,
  onTranslated: (translatedMessage: string) => void
) {
  try {
    const messages = [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      }
    ];

    const response = await fetch(translationApiUrl, {
      method: `POST`,
      headers: {
        "content-type": `application/json`,
        accept: `text/event-stream`,
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
      body: JSON.stringify({
        model: modal,
        temperature: 0.7,
        stream: true,
        messages: messages,
        max_tokens: 1100,
        stop: '### Instruction:'
      }),
    });

    if (response.status !== 200) {
      throw new Error("Error translating message");
    }

    let translatedMessage = "";

    const reader: any = response.body?.getReader();
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      let chunk = new TextDecoder("utf-8").decode(value, { stream: true });

      const chunks = chunk.split("\n").filter((x: string) => x !== "");

      chunks.forEach((chunk: string) => {
        if (chunk === "data: [DONE]") {
          return;
        }
        if (!chunk.startsWith("data: ")) return;
        chunk = chunk.replace("data: ", "");
        const data = JSON.parse(chunk);
        translatedMessage += data.choices[0].delta.content;
        if (data.choices[0].finish_reason === "stop") return;
      });
    }

    onTranslated(translatedMessage);

  } catch (error) {
    if (error instanceof DOMException || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}
export async function fetchResult(
  messages: any,
  modal: string,
  signal: AbortSignal,
  onData: (data: any) => void,
  onDataEdit: (data: any) => void,
  onCompletion: () => void
) {

const userMessage = messages[messages.length - 1].content;

  try {
    const response = await fetch(ragApiUrl + "/simplequery", {
      method: `POST`,
      signal: signal,
      headers: {
        "content-type": `application/json`,
        accept: `text/event-stream`,
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
      body: JSON.stringify({ query: userMessage })
    });
    if (response.status !== 200) {
      throw new Error("Error fetching results");
    }
    const reader: any = response.body?.getReader();
    while (true) {
      const { done, value } = await reader.read();

      let chunk1 = new TextDecoder("utf-8").decode(value, { stream: true });
   
      let chunks1 = JSON.parse(chunk1).result.response
      messages.push({role: "system", content: `Ты - лучшая экспертная система вопросов и ответов. Старайся использовать для ответа релевантную информацию если она есть в диалоге. Отвечай на русском.\n\n Справочная информация: ${chunks1}` })
      if (true) {
          await fetchResults(messages, modal, signal, onData, onDataEdit, onCompletion);
        break;
      }
      // let chunk = new TextDecoder("utf-8").decode(value, { stream: true });

      // const chunks = chunk.split("\n").filter((x: string) => x !== "");

      // chunks.forEach((chunk: string) => {
      //   if (chunk === "data: [DONE]") {
      //     return;
      //   }
      //   if (!chunk.startsWith("data: ")) return;
      //   chunk = chunk.replace("data: ", "");
      //   const data = JSON.parse(chunk);
      //   if (data.choices[0].finish_reason === "stop") return;
      //   onData(data.choices[0].delta.content);
	    //   fullMessage += data.choices[0].delta.content;
      // });
    }
  } catch (error) {
    if (error instanceof DOMException || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

export async function fetchResults(
  messages: any,
  modal: string,
  signal: AbortSignal,
  onData: any,
  onDataEdit: any,
  onCompletion: any
) {
const store = useSettings;
const translate = store.getState().settings.translateChatMessage;

if (messages.length > 0 && translate) {
	const userMessage = messages[messages.length - 1].content;
    await translateMessage(modal, signal, userMessage, TranslateSystemMessage, translatedMessage => {
      messages[messages.length - 1].content = translatedMessage;
    });
 }

  try {
    const response = await fetch(apiUrl, {
      method: `POST`,
      signal: signal,
      headers: {
        "content-type": `application/json`,
        accept: `text/event-stream`,
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
      body: JSON.stringify({
        model: modal,
        temperature: 0.7,
        stream: true,
        messages: messages,
        max_tokens: 1100,
        stop: '</s>'
      }),
    });

    if (response.status !== 200) {
      throw new Error("Error fetching results");
    }
    const reader: any = response.body?.getReader();
    let fullMessage = '';
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (translate) {
          await translateMessage(modal, signal, fullMessage, TranslateSystemMessageBack, translatedModelResponse => {
            fullMessage = translatedModelResponse;
            onDataEdit(fullMessage);
          });
        }
        onCompletion();
        break;
      }

      let chunk = new TextDecoder("utf-8").decode(value, { stream: true });

      const chunks = chunk.split("\n").filter((x: string) => x !== "");

      chunks.forEach((chunk: string) => {
        if (chunk === "data: [DONE]") {
          return;
        }
        if (!chunk.startsWith("data: ")) return;
        chunk = chunk.replace("data: ", "");
        const data = JSON.parse(chunk);
        if (data.choices[0].finish_reason === "stop") return;
        onData(data.choices[0].delta.content);
	      fullMessage += data.choices[0].delta.content;
      });

    }
  } catch (error) {
    if (error instanceof DOMException || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

export async function fetchModals() {
  try {
    const response = await fetch(localStorage.getItem("apiUrl") + "/v1/models", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DOMException || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}
