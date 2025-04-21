import requests
from bs4 import BeautifulSoup
import re
from sqlalchemy.orm import Session
from models import Podcast
from database import SessionLocal


def extract_clean_transcript(text: str) -> str:
    """
    Очищает текст транскрипта, оставляя только основное содержание между 
    "Podcast Number" и "Podcast X Quiz"
    """
    lines = text.splitlines()
    
    start_idx = next((i for i, line in enumerate(lines) if "Podcast Number" in line), None)
    end_idx = next((i for i, line in enumerate(lines) if re.match(r"Podcast \d+ Quiz", line.strip())), None)

    if start_idx is None or end_idx is None:
        return text.strip()

    clean_lines = lines[start_idx:end_idx]
    return "\n".join(clean_lines).strip()


def download_podcast(podcast_url: str) -> dict:
    """
    Скачивает данные подкаста (транскрипт и аудио) с указанного URL
    Возвращает словарь с title, transcript и audio
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/",
    }

    response = requests.get(podcast_url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Ошибка при загрузке страницы: {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")
    
    # Поиск блока с транскриптом
    transcript_div = soup.find('div', class_='post-content') or \
                     soup.find('div', class_='entry-content') or \
                     soup.find('article')
    if not transcript_div:
        raise Exception("Не найден блок с транскриптом.")

    full_transcript = transcript_div.get_text(separator='\n').strip()
    transcript = extract_clean_transcript(full_transcript)

    # Поиск ссылки на аудио
    mp3_tag = soup.find('a', href=lambda href: href and href.endswith('.mp3'))
    if not mp3_tag:
        raise Exception("Не найден mp3-файл")

    mp3_url = mp3_tag['href']
    mp3_data = requests.get(mp3_url, headers=headers).content

    return {
        "title": soup.title.string.strip(),
        "transcript": transcript,
        "audio": mp3_data,
    }


def get_podcast_links(url: str) -> list:
    """
    Получает все ссылки на подкасты с указанной страницы
    Возвращает список URL
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/",
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Ошибка загрузки страницы: {response.status_code}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    podcast_links = []
    
    for link in soup.find_all('a', href=True):
        href = link['href']
        if 'podcast' in href:
            if href.startswith('http'):
                podcast_links.append(href)
            else:
                podcast_links.append(url + href)

    return podcast_links


def save_podcast_to_db(session: Session, podcast_data: dict) -> Podcast:
    """
    Сохраняет данные подкаста в базу данных
    Возвращает сохраненный объект Podcast
    """
    podcast = Podcast(
        title=podcast_data['title'],
        audio=podcast_data['audio'],
        transcript=podcast_data['transcript'],
    )

    session.add(podcast)
    session.commit()
    session.refresh(podcast)

    print(f"Подкаст '{podcast.title}' успешно добавлен в базу данных!")
    return podcast


def main():
    """Основная функция для выполнения скрипта"""
    db = SessionLocal()
    base_url = "https://slowenglish.info/podcast-1-introduction/"
    
    try:
        podcast_links = get_podcast_links(base_url)
        count = 0
        
        for link in podcast_links[-50:]:
            try:
                print(f"Обработка: {link}")
                podcast_data = download_podcast(link)
                save_podcast_to_db(db, podcast_data)
                count += 1
                print(f"Успешно сохранено: {count}")
            except Exception as e:
                print(f"Ошибка при обработке {link}: {str(e)}")
                continue
                
    finally:
        db.close()
import re

def clean_podcast_text(raw_text: str) -> str:
    # Удаление ссылок (http, https, www)
    text = re.sub(r'https?://\S+|www\.\S+', '', raw_text)
    
    # Удаление email-адресов
    text = re.sub(r'\S+@\S+', '', text)

    # Замена двух и более табов на один пробел
    text = re.sub(r'\t{2,}', ' ', text)

    # Замена всех одинарных табов на пробел
    text = text.replace('\t', ' ')

    # Удаление лишних пустых строк
    lines = text.splitlines()
    cleaned_lines = [line.strip() for line in lines if line.strip()]
    
    return '\n'.join(cleaned_lines)


if __name__ == "__main__":
    #main()
    print(clean_podcast_text())