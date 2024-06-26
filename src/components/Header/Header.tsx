import { IonIcon } from "@ionic/react";
import { shareOutline, informationCircleOutline } from "ionicons/icons";
import { useSettings } from "../../store/store";
import { useState, useEffect } from "react";
export default function Header(props: {systemMessageTrigger: any}) {
  const [storeSystemMessage, setSystemMessage] = useSettings(state => [
    state.settings.systemMessage, 
    state.setSystemMessage
  ]);
  const [model, systemMessage, useSystemMessageForAllChats] = useSettings(
    (state) => [
      state.settings.selectedModal,
      state.settings.systemMessage,
      state.settings.useSystemMessageForAllChats,
    ]
  );

  let message: string;
  message = 'Ты - лучшая экспертная система вопросов и ответов. Старайся использовать для ответа релевантную информацию если она есть в диалоге. Старайся избегать применения собственных знаний без необходимости.'

  function chooseMessage(){
		const id = localStorage.getItem('prev')
		switch (id) {
			case 'tasks':
				message = 'Ты - лучшая экспертная система вопросов и ответов. Старайся использовать для ответа релевантную информацию если она есть в диалоге. Старайся избегать применения собственных знаний без необходимости.'
				break;
		}
	}
   useEffect(() => {
    // устанавливаем default при монтировании
      chooseMessage()
      setSystemMessage({
        message: message,
        useForAllChats: true
      });
  }, [setSystemMessage, props.systemMessageTrigger]);
  return (
    <header className=" text-center my-2 text-sm dark:text-gray-300 border-b dark:border-none dark:shadow-md py-2 flex items-center justify-between px-2">
      <div className="md:block hidden"></div>
      <div className=" flex items-center relative">
        <span>Using ({model.toLocaleUpperCase()})</span>
        {useSystemMessageForAllChats && (
          <span className=" flex text-xl ml-2 group cursor-pointer hover-show-window">
            <IonIcon icon={informationCircleOutline} />
            <span className="info-window absolute2 z-10 left-0 w-[calc(100%+20rem)] top-[calc(100%+1rem)] text-sm bg-gray-900 text-white p-2 rounded-md invisible  pointer-events-none group-hover:visible group-hover:pointer-events-auto transition">
              <span className=" block underline text-teal-600">
                <strong>System message</strong>
              </span>
              <span className=" text-gray-400 block text-left text-xs">
                {systemMessage}
              </span>
            </span>
          </span>
        )}
      </div>
      <div className="">
        <button className=" text-xl">
          <IonIcon icon={shareOutline} />
        </button>
      </div>
    </header>
  );
}
