from vosk import Model, KaldiRecognizer
import pyaudio
import json
import wave
def recognize_speech(model_path="vosk-model-small-en-us-0.15", sample_rate=16000):
    # Инициализация модели и распознавателя
    model = Model(model_path)
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
        
def recognize_speech_from_wav(wav_path, model_path="vosk-model-small-en-us-0.15"):
    # Инициализация модели
    model = Model(model_path)
    
    # Открытие WAV-файла
    with wave.open(wav_path, "rb") as wf:
        sample_rate = wf.getframerate()
        
        # Инициализация распознавателя с параметрами файла
        recognizer = KaldiRecognizer(model, sample_rate)
        
        # Чтение и обработка данных
        while True:
            data = wf.readframes(4096)
            if len(data) == 0:
                break
            if recognizer.AcceptWaveform(data):
                pass  # Промежуточные результаты можно обрабатывать здесь
        
        # Получение финального результата
        result = json.loads(recognizer.FinalResult())
        return result.get("text", "")
if __name__ ==("__main__"):
    print(recognize_speech(model_path="vosk-model-en-us-0.22"))