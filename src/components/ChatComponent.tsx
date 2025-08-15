'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatComponentProps {
  groupName: string;
  onClose: () => void;
}

// Málaga Quest - Zona Vialia

const ChatComponent: React.FC<ChatComponentProps> = ({ groupName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // Sistema de puntuación
  const [totalScore, setTotalScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0); // Para animación gradual
  const [currentLevel, setCurrentLevel] = useState('Novato curioso');
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);

  // Estados para animaciones optimizadas para móvil
  const [isScoreAnimating, setIsScoreAnimating] = useState(false);
  const [isLevelAnimating, setIsLevelAnimating] = useState(false);
  const [scoreGlow, setScoreGlow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para animar el incremento de números optimizada para móvil
  const animateScoreIncrease = useCallback((oldScore: number, newScore: number) => {
    if (oldScore === newScore) return;

    setIsScoreAnimating(true);
    setScoreGlow(true);

    const difference = newScore - oldScore;
    // Reducir duración y steps en móviles para mejor performance
    const baseDuration = isMobile ? 800 : 1500;
    const baseSteps = isMobile ? 15 : 30;

    const duration = Math.min(baseDuration, Math.max(300, difference * 2));
    const steps = Math.min(baseSteps, Math.max(8, difference / 15));
    const stepValue = difference / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const incrementStep = () => {
      currentStep++;
      const intermediateScore = Math.round(oldScore + (stepValue * currentStep));
      setDisplayScore(Math.min(intermediateScore, newScore));

      if (currentStep < steps && intermediateScore < newScore) {
        setTimeout(incrementStep, stepDuration);
      } else {
        setDisplayScore(newScore);
        setIsScoreAnimating(false);

        // Quitar glow después de la animación
        setTimeout(() => setScoreGlow(false), isMobile ? 200 : 300);
      }
    };

    incrementStep();
  }, [isMobile]);

  // Función para determinar nivel basado en puntos
  const getLevelFromScore = useCallback((score: number): string => {
    if (score >= 9) return 'Leyenda absoluta';
    if (score >= 7) return 'Maestro notable';
    if (score >= 4) return 'Investigador aplicado';
    return 'Novato curioso';
  }, []);

  // Función para obtener color del nivel
  const getLevelColor = useCallback((level: string): string => {
    switch (level) {
      case 'Leyenda absoluta': return 'bg-yellow-600/20 text-yellow-200 border-yellow-500';
      case 'Maestro notable': return 'bg-purple-600/20 text-purple-200 border-purple-500';
      case 'Investigador aplicado': return 'bg-blue-600/20 text-blue-200 border-blue-500';
      case 'Novato curioso': return 'bg-gray-600/20 text-gray-200 border-gray-500';
      default: return 'bg-gray-600/20 text-gray-200 border-gray-500';
    }
  }, []);

  // Función para detectar pruebas completadas por patrones específicos
  const detectPuzzleCompletion = useCallback((response: string) => {
    // Patrones que indican prueba completada
    const completionPatterns = [
      /has superado esta prueba/i,
      /has ganado \d+ puntos/i,
      /¡milagro! has resuelto el enigma correctamente/i,
      /bien hecho con/i,
      /puedes pasar a la siguiente prueba/i,
      /prepárate para sufrir más/i,
      /continúa antes de que se te suba/i,
      /vaya\. no esperaba tanto de ti/i
    ];

    const isCompleted = completionPatterns.some(pattern => pattern.test(response));

    if (isCompleted) {
      const currentCompleted = puzzlesCompleted;
      const newCompleted = Math.min(currentCompleted + 1, 12);

      if (newCompleted > currentCompleted) {
        setPuzzlesCompleted(newCompleted);
        localStorage.setItem(`malaga-quest-vialia-${groupName}-puzzles`, newCompleted.toString());
        console.log(`🧩 Puzzle completed! Total: ${newCompleted}/9`);
      }
    }
  }, [puzzlesCompleted, groupName]);

  // Función para extraer puntos de la respuesta del Maestro
  const extractScoreFromResponse = useCallback((response: string) => {
    // Buscar patrones de puntuación en la respuesta
    const scorePatterns = [
      /puntuación total[:\s]*(\d+)\/6000/i,
      /tu puntuación[:\s]*(\d+)\/6000/i,
      /total[:\s]*(\d+)\/6000/i,
      /(\d+)\/6000/i
    ];

    for (const pattern of scorePatterns) {
      const match = response.match(pattern);
      if (match) {
        const newScore = parseInt(match[1]);
        if (!isNaN(newScore) && newScore >= 0 && newScore <= 6000) {
          const oldScore = totalScore;
          const oldLevel = currentLevel;
          const newLevel = getLevelFromScore(newScore);

          // Animar incremento de puntos si hay diferencia
          if (newScore > oldScore) {
            animateScoreIncrease(displayScore, newScore);
          } else {
            setDisplayScore(newScore);
          }

          setTotalScore(newScore);

          // Animar cambio de nivel si es diferente (reducido en móvil)
          if (newLevel !== oldLevel) {
            setIsLevelAnimating(true);
            setTimeout(() => setIsLevelAnimating(false), isMobile ? 600 : 1000);
          }

          setCurrentLevel(newLevel);

          // Guardar en localStorage
          localStorage.setItem(`malaga-quest-vialia-${groupName}-score`, newScore.toString());
          localStorage.setItem(`malaga-quest-vialia-${groupName}-level`, newLevel);

          break;
        }
      }
    }

    // Detectar si se completó una prueba
    detectPuzzleCompletion(response);
  }, [groupName, getLevelFromScore, totalScore, currentLevel, displayScore, animateScoreIncrease, detectPuzzleCompletion, isMobile]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Efecto typewriter
  const typeWriterEffect = useCallback((text: string) => {
    setIsStreaming(true);
    setStreamingText('');

    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setStreamingText(text.slice(0, index));
        index++;
        scrollToBottom();
      } else {
        setIsStreaming(false);
        clearInterval(timer);
      }
    }, 15); // 15ms por carácter para velocidad rápida
  }, [scrollToBottom]);

  // Persistencia de sesión y puntuación
  useEffect(() => {
    const savedMessages = localStorage.getItem(`malaga-quest-vialia-${groupName}`);
    const savedScore = localStorage.getItem(`malaga-quest-vialia-${groupName}-score`);
    const savedLevel = localStorage.getItem(`malaga-quest-vialia-${groupName}-level`);
    const savedPuzzles = localStorage.getItem(`malaga-quest-vialia-${groupName}-puzzles`);

    // Cargar puntuación guardada
    if (savedScore) {
      const score = parseInt(savedScore);
      if (!isNaN(score)) {
        setTotalScore(score);
        setDisplayScore(score); // Sin animación al cargar
      }
    }
    if (savedLevel) {
      setCurrentLevel(savedLevel);
    }
    if (savedPuzzles) {
      const puzzles = parseInt(savedPuzzles);
      if (!isNaN(puzzles)) {
        setPuzzlesCompleted(puzzles);
      }
    }

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    } else {
      // Mensaje de bienvenida del nuevo Maestro
      const welcomeMessage = {
        role: 'assistant' as const,
        content: `¡Hola, mis queridos aventureros! Soy el Maestro del Enigma, vuestro guía en Málaga Quest - Zona Vialia.

Grupo "${groupName}", ¿verdad? Perfecto. Espero que tengáis las neuronas bien engrasadas porque os espera una aventura de primera.

¿Habéis venido desde el Centro Histórico? ¡Vaya, vaya! Pues aquí las cosas son diferentes. Más urbanas, más modernas, pero igual de retorcidas.

¿Estáis listos para empezar? Escribid "EMPEZAR" y os daré vuestra primera prueba. ¡Que empiece el espectáculo!`,
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
      typeWriterEffect(welcomeMessage.content);
    }
  }, [groupName, typeWriterEffect]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    const currentTimeout = animationTimeoutRef.current;
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, []);

  // Guardar mensajes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`malaga-quest-vialia-${groupName}`, JSON.stringify(messages));
    }
  }, [messages, groupName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  // Enviar mensaje de texto
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageContent.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Preparar mensajes para el API
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Respuesta simple de Claude
      const data = await response.json();
      const content = data.content || 'Error al obtener respuesta';

      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Extraer puntuación de la respuesta
      extractScoreFromResponse(content);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Error al conectar con el Maestro. Inténtalo de nuevo.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAndSend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error al acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcripción y envío automático
  const transcribeAndSend = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('action', 'transcribe');

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.transcription) {
        await sendMessage(data.transcription);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error al transcribir el audio. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    if (confirm('¿Seguro que quieres empezar una nueva partida? Se perderá todo el progreso.')) {
      localStorage.removeItem(`malaga-quest-vialia-${groupName}`);
      localStorage.removeItem(`malaga-quest-vialia-${groupName}-score`);
      localStorage.removeItem(`malaga-quest-vialia-${groupName}-level`);
      localStorage.removeItem(`malaga-quest-vialia-${groupName}-puzzles`);
      setMessages([]);
      setTotalScore(0);
      setDisplayScore(0);
      setCurrentLevel('Novato curioso');
      setPuzzlesCompleted(0);
      location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-yellow-400 mb-1">
              🚂 MÁLAGA QUEST - ZONA VIALIA 🚂
            </h1>
            <p className="text-purple-200 text-xs md:text-sm">
              Aventura Urbana en el Corazón de la Estación
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-purple-600/50 text-purple-100 text-xs">
              Grupo: {groupName}
            </Badge>
          </div>

          {/* Contador de Puntuación con Animaciones Optimizadas para Móvil */}
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`bg-yellow-600/20 border-yellow-500 text-yellow-200 px-2 md:px-3 py-1 text-xs transition-all ${
                isMobile ? 'duration-200' : 'duration-300'
              } ${
                scoreGlow ? (isMobile ? 'shadow-md shadow-yellow-500/30 scale-102' : 'shadow-lg shadow-yellow-500/50 scale-105') : ''
              } ${isScoreAnimating ? 'animate-pulse' : ''}`}
            >
              💰 {displayScore}/6000
            </Badge>
            <Badge
              variant="outline"
              className={`px-2 md:px-3 py-1 text-xs transition-all ${
                isMobile ? 'duration-300' : 'duration-500'
              } ${getLevelColor(currentLevel)} ${
                isLevelAnimating ? (isMobile ? 'animate-pulse scale-105' : 'animate-bounce scale-110') : ''
              }`}
            >
              🏆 <span className="hidden sm:inline">{currentLevel}</span><span className="sm:hidden">{currentLevel.split(' ')[0]}</span>
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-600/20 border-green-500 text-green-200 px-2 md:px-3 py-1 text-xs transition-all duration-300"
            >
              🧩 {puzzlesCompleted}/9
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={clearSession}
              variant="outline"
              size="sm"
              className="bg-red-600/20 border-red-500 text-red-200 hover:bg-red-600/40 text-xs"
            >
              🔄 Nueva
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="bg-purple-600/20 border-purple-500 text-purple-200 hover:bg-purple-600/40 text-xs"
            >
              ← Volver
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-2 md:p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[85%] md:max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-yellow-600/90 border-yellow-500 text-black border-2 md:border-4'
                    : 'bg-purple-900/90 border-purple-500 text-purple-100'
                }`}>
                  <CardContent className={`p-2 md:p-3 ${message.role === 'user' ? 'text-base md:text-lg font-medium' : 'text-sm md:text-base'}`}>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Streaming text */}
            {isStreaming && (
              <div className="flex justify-start">
                <Card className="max-w-[85%] md:max-w-[80%] bg-purple-900/90 border-purple-500 text-purple-100">
                  <CardContent className="p-2 md:p-3 text-sm md:text-base">
                    <div className="whitespace-pre-wrap">
                      {streamingText}
                      <span className="animate-pulse">▊</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <Card className="bg-purple-800/50 border-purple-500">
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center gap-2 text-purple-200">
                      <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                      <span className="text-xs md:text-sm">Maestro escribiendo...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-black/40 backdrop-blur-sm border-t border-purple-500/30 p-2 md:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(currentMessage)}
                placeholder="Escribe tu respuesta..."
                disabled={isLoading}
                className="flex-1 bg-purple-900/50 border-purple-500 text-purple-100 placeholder-purple-300 text-sm md:text-lg"
              />

              <Button
                onClick={() => sendMessage(currentMessage)}
                disabled={isLoading || !currentMessage.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold text-xs md:text-sm px-2 md:px-4"
              >
                Enviar
              </Button>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`${isRecording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-bold w-12 md:w-20`}
              >
                {isRecording ? '⏹️' : '🎤'}
              </Button>
            </div>

            <div className="text-xs text-purple-300 mt-2 text-center">
              🎤 Micrófono: Transcribe y envía automáticamente tu voz
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
