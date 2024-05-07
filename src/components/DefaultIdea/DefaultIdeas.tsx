import DefaultIdea from "./DefaultIdea";

const defaultIdeas = [
  {
    idea: "Give me code snippet",
    moreContext:
      "Give me a code snippet for a social media app",
  },
  { idea: "Tell me a joke", moreContext: "Tell me a joke" },
  
];

export default function DefaultIdeas({ visible = true }) {
  return (
    <div className={`row1 hidden`}>
      <DefaultIdea ideas={defaultIdeas.slice(0, 2)} />
      <DefaultIdea
        ideas={defaultIdeas.slice(2, 4)}
        myclassNames="hidden md:visible"
      />
    </div>
  );
}
