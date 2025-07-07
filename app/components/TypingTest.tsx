"use client";
import React, { useState, useEffect, useRef } from "react";
import ResultModal from "./ResultModal";
import '../styles/style.sass'

const ENGLISH_WORDS = [
  "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "practice", "typing", "improve", "speed", "accuracy", "keyboard", "random", "words", "nextjs", "framework", "modern", "react", "javascript", "coding", "challenge", "focus", "learn", "test", "skill", "letter", "sentence", "repeat", "write", "space", "time", "minute", "second", "score", "result", "restart", "input", "output", "function", "variable", "array", "object", "string", "number", "boolean", "null", "undefined"
];

function getRandomText(wordCount: number = 15) {
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(Math.random() * ENGLISH_WORDS.length);
    words.push(ENGLISH_WORDS[idx]);
  }
  return words.join(" ");
}

export default function TypingTest() {
  const [wordCount, setWordCount] = useState<number>(15);
  const [targetText, setTargetText] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Para el modal y el historial de WPM
  const [showModal, setShowModal] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  // Tiempos en los que se termina cada palabra
  const [wordTimes, setWordTimes] = useState<number[]>([]);
  const [wordWpm, setWordWpm] = useState<number[]>([]);

  // Métricas avanzadas
  const [accuracy, setAccuracy] = useState<number>(100);
  const [charStats, setCharStats] = useState<{correct: number, incorrect: number, extra: number, missed: number}>({correct: 0, incorrect: 0, extra: 0, missed: 0});
  const [consistency, setConsistency] = useState<number>(100);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);

  // Maneja cambios de cantidad de palabras desde el Navbar
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setWordCount(customEvent.detail);
    };
    window.addEventListener('wordCountChange', handler);
    return () => window.removeEventListener('wordCountChange', handler);
  }, []);

  // Inicializa el texto objetivo al montar, al reiniciar y al cambiar wordCount
  useEffect(() => {
    setTargetText(getRandomText(wordCount));
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setWpm(null);
    setFinished(false);
    setShowModal(false);
    setWpmHistory([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [wordCount]);

  // Lógica para finalizar y calcular WPM y métricas avanzadas
  useEffect(() => {
    if (userInput.length >= targetText.length && targetText.length > 0) {
      setEndTime(Date.now());
      setFinished(true);
      setShowModal(true);
      if (startTime) {
        const minutes = (Date.now() - startTime) / 60000;
        const words = targetText.split(" ").length;
        setWpm(Math.round(words / minutes));
        setTotalTime(Math.round((Date.now() - startTime) / 1000));

        // Calcula WPM por palabra para la gráfica
        const times = [...wordTimes, Date.now() - startTime];
        const wpms = times.map((t, idx) => {
          const min = t / 60000;
          return min > 0 ? Math.round((idx + 1) / min) : 0;
        });
        setWordWpm(wpms);
      }

      // Caracteres
      const target = targetText.split("");
      const input = userInput.split("");
      let correct = 0, incorrect = 0, extra = 0, missed = 0, errors = 0;
      for (let i = 0; i < Math.max(target.length, input.length); i++) {
        if (input[i] === undefined) missed++;
        else if (target[i] === undefined) extra++;
        else if (input[i] === target[i]) correct++;
        else { incorrect++; errors++; }
      }
      setCharStats({correct, incorrect, extra, missed});
      setErrorCount(errors + extra + missed);

      // Precisión
      const totalTyped = correct + incorrect + extra;
      setAccuracy(totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100);

      // Consistencia (desviación estándar de WPM)
      if (wpmHistory.length > 1) {
        const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
        const variance = wpmHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpmHistory.length;
        setConsistency(100 - Math.round(Math.sqrt(variance)));
      } else {
        setConsistency(100);
      }

      // Raw WPM (sin contar errores)
      const raw = userInput.trim().split(/\s+/).length / ((Date.now() - (startTime ?? 0)) / 60000);
      setRawWpm(Math.round(raw));
    }
  }, [userInput, targetText, startTime, wpmHistory]);

  // Historial de WPM por segundo
  useEffect(() => {
    if (!startTime || finished) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - (startTime ?? 0)) / 60000;
      const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;
      const currentWpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
      setWpmHistory(prev => [...prev, currentWpm]);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, finished, userInput]);

  // Al finalizar, agrega el valor final de wpm al historial si no está
  useEffect(() => {
    if (finished && wpm !== null) {
      setWpmHistory(prev => {
        // Solo agrega si el historial está vacío o el último valor es distinto
        if (prev.length === 0 || prev[prev.length - 1] !== wpm) {
          return [...prev, wpm];
        }
        return prev;
      });
    }
  }, [finished, wpm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startTime) setStartTime(Date.now());
    if (finished) return;
    const value = e.target.value;
    // Detecta si el usuario terminó una palabra (presionó espacio)
    if (value.length > userInput.length && value[value.length - 1] === ' ') {
      // Registra el timestamp relativo al inicio
      if (startTime) {
        setWordTimes(prev => [...prev, Date.now() - startTime]);
      }
    }
    setUserInput(value);
  };

  const handleRestart = () => {
    setTargetText(getRandomText(wordCount));
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setWpm(null);
    setFinished(false);
    setShowModal(false);
    setWpmHistory([]);
    setWordTimes([]);
    setWordWpm([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };


  return (
    <>
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded dark:bg-[#24283B]">
        <div
          className="mb-4 text-lg font-mono select-none flex flex-wrap gap-y-1 items-center min-h-[60px]"
          data-testid="target-text"
          style={{ cursor: "text" }}
          onClick={() => inputRef.current?.focus()}
        >
          {(() => {
            const letters = targetText.split("");
            const inputLetters = userInput.split("");
            return letters.map((char, idx) => {
              let className = "letter ";
              if (char === " ") {
                className += "letter-space";
              } else if (idx < inputLetters.length) {
                className += inputLetters[idx] === char ? "letter-correct" : "letter-incorrect";
              } else if (idx === inputLetters.length && !finished) {
                className += "letter-current";
              } else {
                className += "letter-pending";
              }
              return (
                <span key={idx} className={className}>
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            });
          })()}
        </div>
        {/* Input invisible para capturar la entrada */}
        <input
          ref={inputRef}
          className="absolute opacity-0 pointer-events-none"
          type="text"
          value={userInput}
          onChange={handleChange}
          disabled={finished}
          autoFocus
          data-testid="typing-input"
        />
        {finished && (
          <div className="text-center mt-4">
            <button
              className="mt-4 px-4 py-2 bg-[#7441DA] text-white rounded hover:bg-blue-700"
              onClick={handleRestart}
            >
              Reiniciar
            </button>
          </div>
        )}
      </div>
      <ResultModal
        open={showModal}
        wpm={wpm}
        wpmHistory={wpmHistory}
        onClose={() => setShowModal(false)}
        accuracy={accuracy}
        charStats={charStats}
        consistency={consistency}
        rawWpm={rawWpm}
        errorCount={errorCount}
        totalTime={totalTime}
        wordTimes={wordTimes}
        wordWpm={wordWpm}
      />
    </>
  );
}
