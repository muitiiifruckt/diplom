
from gtts import gTTS
import os

def text_to_speech(text, filename="output.wav", folder="send", lang='en'):
    """
    Сохраняет озвученный текст в MP3-файл с использованием gTTS.

    :param text: Текст для озвучки
    :param filename: Имя файла (по умолчанию "output.mp3")
    :param folder: Папка для сохранения (по умолчанию "send")
    :param lang: Язык озвучки (по умолчанию 'en')
    """
    try:
        # Создаем папку, если её нет
        if not os.path.exists(folder):
            os.makedirs(folder)
            print(f"Папка '{folder}' создана.")

        # Полный путь к файлу
        output_path = os.path.join(folder, filename)

        # Инициализация и сохранение через gTTS
        tts = gTTS(text=text, lang=lang)
        tts.save(output_path)
        print(text)
        print(f"Аудио сохранено в: {os.path.abspath(output_path)}")


            
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ ==("__main__"):
    #print(say_text("hello"))
    pass