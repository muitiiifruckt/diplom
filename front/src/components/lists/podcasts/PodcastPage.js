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
    <div className="podcast-page">
      <h2>{podcast.title}</h2>
      <audio
        controls
        src={`${API_BASE_URL}${podcast.download_url}`}
      />
      <div className="podcast-transcript">
        <WordHighlighter
          text={podcast.transcript.replace(/\s+/g, " ").trim()}
          selectedWord={selectedWord}
          onWordClick={handleWordClick}
        />
      </div>

      {/* Модальное окно */}
      {showModal && wordInfo && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                background: "transparent",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#e4e6eb"
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