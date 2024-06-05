import { IonIcon } from "@ionic/react";
import { shareOutline, informationCircleOutline } from "ionicons/icons";
import { useRag, useSettings } from "../../store/store";
import { useState, useEffect } from "react";
import { text } from "stream/consumers";
import config from '../../config/defaultSettings.json';
export default function MessageSelector() {
	let text: string;
	let message: string;
  const [rag, setRag] = useRag((state) => [state.rag, state.setRag])

  const [storeSystemMessage, setSystemMessage] = useSettings((state) => [
    state.settings.systemMessage,
    state.setSystemMessage,
  ]);
  const [model, systemMessage, useSystemMessageForAllChats] = useSettings(
    (state) => [
      state.settings.selectedModal,
      state.settings.systemMessage,
      state.settings.useSystemMessageForAllChats,
    ]
  );

  async function chooseModelTrained() {
    // Временно закомментировано для отладки
    // await fetch( config.apiUrl+ '/v1/internal/model/load', {
    //   method: `POST`,
    //   headers: {
    //     "content-type": `application/json`,
    //     accept: `text/event-stream`,
    //     Authorization: `Bearer ${localStorage.getItem("apikey")}`,
    //   },
    //   body: JSON.stringify({
    //     "model_name": "Meta-Llama-3-8B-Instruct-Q8_0.gguf",
    //     "args": {"cache_4bit": true, "max_seq_len": 32786},
    //     "settings": {}
    //   }),
    // });
  }

	async function chooseModelStandart(){
    
    // Временно закомментировано для отладки
    // await fetch( config.apiUrl+ '/v1/internal/model/load', {
    //   method: `POST`,
    //   headers: {
    //     "content-type": `application/json`,
    //     accept: `text/event-stream`,
    //     Authorization: `Bearer ${localStorage.getItem("apikey")}`,
    //   },
    //   body: JSON.stringify({
    //     "model_name": "Meta-Llama-3-8B-Instruct-Q8_0.gguf",
    //     "args": {"cache_4bit": true, "max_seq_len": 32786},
    //     "settings": {}
    //   }),
    // });

	}

	async function chooseModelMixtral(){
    // Временно закомментировано для отладки
    // await fetch( config.apiUrl+ '/v1/internal/model/load', {
    //   method: `POST`,
    //   headers: {
    //     "content-type": `application/json`,
    //     accept: `text/event-stream`,
    //     Authorization: `Bearer ${localStorage.getItem("apikey")}`,
    //   },
    //   body: JSON.stringify({
    //     "model_name": "Meta-Llama-3-8B-Instruct-Q8_0.gguf",
    //     "args": {"cache_4bit": true, "max_seq_len": 32786},
    //     "settings": {}
    //   }),
    // });

	}

	function saveChoosenPoint(){
		const activeId = localStorage.getItem('prev')
		const selectorText = document.querySelector('#selector-text')
		if(activeId !== null){
			text = document.querySelector(`#${activeId}`)!.innerHTML
			document.querySelector(`#${activeId}`)?.classList.add('active')
			selectorText!.innerHTML = text!
		}else{
			text = document.querySelector(`#tasks`)!.innerHTML
			document.querySelector(`#tasks`)?.classList.add('active')
			selectorText!.innerHTML = text!
		}
		
	}

	function addActiveClass(e: any){
		const selectorText = document.querySelector('#selector-text')
		const arrPoint = document.querySelectorAll('.selector-point')

		arrPoint.forEach((item) => {
			item.classList.remove('active')
		})

		e.target.classList.add('active')
		selectorText!.innerHTML = e.target.innerHTML

		localStorage.setItem('prev', e.target.id)
    // e.target.id === 'question' ? chooseModelStandart() : chooseModelTrained()
    // setRag(e.target.id === 'question' ? false : true)
    if (e.target.id === 'tasks') {
      chooseModelStandart()
      setRag(true)
    } else if (e.target.id === 'orders') {
      chooseModelStandart()
      setRag(true)
    } else {
      chooseModelStandart()
      setRag(true)
    }
    localStorage.setItem('rag', `${e.target.id === 'tasks'}`)
	};

  function AddAnimation() {
    const selector = document.querySelector(".selector");
    const selectorText = document.querySelector(".selector-text");
    selector?.classList.toggle("collapse-animation");
    selector?.classList.toggle("border");
    selectorText?.classList.toggle("collapse-animation");
  };

	
  useEffect(() => {
    // устанавливаем default при монтировании
		saveChoosenPoint()
    setSystemMessage({
      message: "",
      useForAllChats: true,
    });
  }, [setSystemMessage]);
  return (
    <div>
      <div>
        <p className="text-gray-300 text-center p-3 text-3xl italic">
          Выберите режим работы
        </p>
        <div className="bg-transparent border w-1/2  p-4 rounded mx-auto flex justify-between">
          <p className="text-gray-300 text-lg" id="selector-text">{text!}</p>
          <div
            className="flex items-center cursor-pointer"
            onClick={AddAnimation}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.0974 7.91556C16.4524 7.56053 16.4524 6.98493 16.0974 6.62991C15.7424 6.27488 15.1667 6.27488 14.8117 6.62991L9.99999 11.4416L5.18827 6.62991C4.83324 6.27488 4.25764 6.27488 3.90262 6.62991C3.5476 6.98493 3.5476 7.56053 3.90262 7.91556L9.35716 13.3701C9.71219 13.7251 10.2878 13.7251 10.6428 13.3701L16.0974 7.91556Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="text-gray-300 text-lg bg-transparent w-1/2 rounded mx-auto my-2 selector relative">
        <div className="selector-text">
          <p className="px-4 py-3 cursor-pointer selector-point" id="tasks" onClick={addActiveClass}>Вопросы по регламентам</p>
        </div>
      </div>
    </div>
  );
}


