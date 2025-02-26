from vosk import Model, KaldiRecognizer
import pyaudio
import json

model = Model("vosk-model-small-en-us-0.15")  # Укажите путь к модели
recognizer = KaldiRecognizer(model, 16000)

mic = pyaudio.PyAudio()
stream = mic.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=8192)

print("Говорите...")
while True:
    data = stream.read(4096)
    if recognizer.AcceptWaveform(data):
        result = json.loads(recognizer.Result())
        text = result.get("text", "")
        print("Распознанный текст:", text)
        break   