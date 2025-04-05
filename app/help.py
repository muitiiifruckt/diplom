from vosk import Model, KaldiRecognizer
import pyaudio
import json

def recognize_speech(model_path="vosk-model-small-en-us-0.15", sample_rate=16000):
    # Инициализация модели и распознавателя
    model = Model("vosk-model-small-en-us-0.15")
    recognizer = KaldiRecognizer(model, sample_rate)

    # Инициализация микрофона
    mic = pyaudio.PyAudio()
    stream = mic.open(format=pyaudio.paInt16, channels=1, rate=sample_rate, input=True, frames_per_buffer=8192)

    print("Говорите...")

    # Слушаем и распознаем речь
    while True:
        data = stream.read(4096)
        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            text = result.get("text", "")
            print("Распознанный текст:", text)
            return text
