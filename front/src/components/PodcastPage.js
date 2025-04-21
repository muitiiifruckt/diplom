import { useEffect, useState } from "react";

function PodcastPage({ onReturnToChat }) {
  const [podcast, setPodcast] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/random-podcast")
      .then((res) => res.json())
      .then((data) => setPodcast(data))
      .catch((err) => console.error("Ошибка при загрузке подкаста", err));
  }, []);

  if (!podcast) return <div>Загрузка подкаста...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{podcast.title}</h2>
      <audio controls src={`http://localhost:8000${podcast.download_url}`} style={{ width: "100%" }} />
      <p style={{ marginTop: "1rem", whiteSpace: "pre-line" }}>{podcast.transcript}</p>
      
    </div>
  );
}

export default PodcastPage;
