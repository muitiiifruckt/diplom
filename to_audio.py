import pyttsx3




def say_text(text):
    # Инициализация движка
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[1].id)  # Измените индекс
    # Установка параметров
    engine.setProperty('rate', 150)  # Скорость речи
    engine.setProperty('volume', 1)  # Громкость (от 0.0 до 1.0)

    # Озвучивание текста
    engine.say(text)
    engine.runAndWait()

