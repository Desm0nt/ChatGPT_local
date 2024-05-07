import { IonIcon } from "@ionic/react";
import { sparkles } from "ionicons/icons";
export default function GptIntro() {
  return (
    <>
      <div className="modals md:w-1/5 md:min-w-[300px] mx-2 relative flex items-center rounded-md justify-between mt-5 md:mx-auto p-1 bg-gray-200 dark:bg-[#202123] gap-2 custom-top-modal">
        <p className="gpt3 uppercase  rounded-md p-2 bg-white flex-1 flex items-center dark:bg-[#40414f] dark:text-white justify-center">
          <span className="mr-2">Open Source Lama2 (local version)</span>
        </p>
      </div>
      <div className=" h-48 flex items-start justify-center">
        <h1 className=" text-4xl font-bold mt-5 text-center text-gray-300">
          Виртуальный Ассистент Extyl
        </h1>
      </div>
    </>
  );
}
