import pyttsx3
import os



def say_text(text):
    # Инициализация движка
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[1].id)  # Измените индекс
    # Установка параметров
    engine.setProperty('rate', 200)  # Скорость речи
    engine.setProperty('volume', 1)  # Громкость (от 0.0 до 1.0)

    # Озвучивание текста
    engine.say(text)
    engine.runAndWait()

def text_to_speech(text, filename="output.wav", folder="send"):
    """
    Сохраняет озвученный текст в WAV-файл в указанной папке.

    :param text: Текст для озвучки
    :param filename: Имя файла (по умолчанию "output.wav")
    :param folder: Папка для сохранения (по умолчанию "send")
    """
    try:
        # Создаем папку, если её нет
        if not os.path.exists(folder):
            os.makedirs(folder)
            print(f"Папка '{folder}' создана.")

        # Полный путь к файлу
        output_path = os.path.join(folder, filename)

        # Инициализация движка TTS
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        engine.setProperty('voice', voices[1].id)  # Выбор голоса
        engine.setProperty('rate', 200)  # Скорость речи
        engine.setProperty('volume', 1.0)  # Громкость

        # Сохранение аудио в файл
        engine.save_to_file(text, output_path)
        engine.runAndWait()

        print(f"Аудио сохранено в: {os.path.abspath(output_path)}")
    except Exception as e:
        print(f"Ошибка: {e}")
if __name__ ==("__main__"):
    print(text_to_speech("hello"))