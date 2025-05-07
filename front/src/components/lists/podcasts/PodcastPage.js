import { useEffect, useState } from "react";
import WordHighlighter from "../../features/WordHighlighter";
import { podcastService, API_BASE_URL } from "../../../services/api";

function PodcastPage({ onReturnToChat }) {
  const [podcast, setPodcast] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordInfo, setWordInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    podcastService.fetchRandomPodcast()
      .then(setPodcast)
      .catch((err) => console.error("Ошибка при загрузке подкаста", err));
  }, []);

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setShowModal(true);
    const token = localStorage.getItem("token");
    podcastService.fetchWordInfo(word, token)
      .then(setWordInfo)
      .catch((err) => console.error("Ошибка при получении информации о слове:", err));
  };

  const closeModal = () => {
    setShowModal(false);
    setWordInfo(null);
    setSelectedWord(null);
  };

  if (!podcast) return <div>Загрузка подкаста...</div>;

  return (
    <div style={{ padding: "1rem", position: "relative" }}>
      <h2>{podcast.title}</h2>
      <audio
        controls
        src={`${API_BASE_URL}${podcast.download_url}`}
        style={{ width: "100%" }}
      />
      <div style={{ marginTop: "1rem", lineHeight: "1.6", fontSize: "1.1em" }}>
        <WordHighlighter
          text={podcast.transcript.replace(/\s+/g, " ").trim()}
          selectedWord={selectedWord}
          onWordClick={handleWordClick}
        />
      </div>

      {/* Модальное окно */}
      {showModal && wordInfo && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()} // не закрывать при клике внутри
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                background: "transparent",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer"
              }}
            >
              &times;
            </button>
            <h3>Слово: <em>{selectedWord}</em></h3>
            <p><strong>Перевод:</strong> {wordInfo.translation}</p>
            <div>
              <strong>Примеры:</strong>
              <ul>
                {wordInfo.examples
                  .split("\n")
                  .filter(e => e.trim())
                  .map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PodcastPage;