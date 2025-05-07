// components/WordHighlighter.jsx
import React from "react";



const WordHighlighter = ({ text, selectedWord, onWordClick }) => {
  const renderWords = () => {
    return text.split(" ").map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:()"\[\]]/g, "");
      return (
        <span
          key={index}
          onClick={() => onWordClick(cleanWord)}
          style={{
            cursor: "pointer",
            marginRight: "0.3em",
            color: "#333",
            padding: "2px 4px",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
            backgroundColor:
              cleanWord.toLowerCase() === selectedWord?.toLowerCase()
                ? "#e0f7fa"
                : "transparent",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#e0f0ff";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor =
              cleanWord.toLowerCase() === selectedWord?.toLowerCase()
                ? "#e0f7fa"
                : "transparent";
          }}
        >
          {word + " "}
        </span>
      );
    });
  };

  return <>{renderWords()}</>;
};

export default WordHighlighter;
