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

	async function chooseModelTrained(){
		await fetch( config.apiUrl+ '/v1/internal/model/load', {
      method: `POST`,
      headers: {
        "content-type": `application/json`,
        accept: `text/event-stream`,
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
      body: JSON.stringify({
				"model_name": "solar19_s133_00004_r128_a64_Q8_0.gguf",
				"args": {"n_gpu_layers": 61},
				"settings": {}
			}),
    });
	}

	async function chooseModelStandart(){
		await fetch(config.apiUrl + '/v1/internal/model/load', {
      method: `POST`,
      headers: {
        "content-type": `application/json`,
        accept: `text/event-stream`,
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
      body: JSON.stringify({
				"model_name": "solar-10.7b-instruct-v1.0.Q4_K_M.gguf",
				"args": {"n_gpu_layers": 61},
				"settings": {}
      }),
    });

	}

	async function chooseModelMixtral(){
		await fetch(config.apiUrl + '/v1/internal/model/load', {
      method: `POST`,
      headers: {
        "content-type": `application/json`,
        accept: `text/event-stream`,
        Authorization: `Bearer ${localStorage.getItem("apikey")}`,
      },
      body: JSON.stringify({
				"model_name": "Nous-Hermes-2-Mixtral-8x7B-DPO.Q4_K_M.gguf",
				"args": {"cpu": true, "max_seq_len": 8192},
				"settings": {}
      }),
    });

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
    if (e.target.id === 'question') {
      chooseModelStandart()
      setRag(false)
    } else if (e.target.id === 'orders') {
      chooseModelMixtral()
      setRag(true)
    } else {
      chooseModelTrained()
      setRag(true)
    }
    localStorage.setItem('rag', `${e.target.id === 'question'}`)
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
      <div className="text-gray-300 text-lg bg-transparent w-1/2 rounded mx-auto my-4 selector relative">
        <div className="selector-text">
          <p className="px-4 py-3 cursor-pointer selector-point" id="tasks" onClick={addActiveClass}>Анализ постановок задач</p>
          <p className="px-4 py-3 cursor-pointer selector-point" id="leads" onClick={addActiveClass}>Анализ лидов</p>
          <p className="px-4 py-3 cursor-pointer selector-point" id="orders" onClick={addActiveClass}>Анализ договоров</p>
          <p className="px-4 py-3 cursor-pointer selector-point" id="question" onClick={addActiveClass}>Вопрос по регламентам</p>
        </div>
      </div>
    </div>
  );
}


