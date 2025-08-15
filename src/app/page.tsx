'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ChatComponent from '@/components/ChatComponent';
import MapComponent from '@/components/MapComponent';

const locations = [
  { name: 'Estación María Zambrano', icon: '🚂' },
  { name: 'Atrio Central', icon: '🏢' },
  { name: 'Zona Comercial', icon: '🛍️' },
  { name: 'Vestíbulo Principal', icon: '🚪' },
  { name: 'Área de Restauración', icon: '🍽️' },
  { name: 'Fachada Principal', icon: '🏗️' },
  { name: 'Plaza de Vialia', icon: '🏛️' },
  { name: 'Zona de Servicios', icon: '🛎️' },
  { name: 'Accesos AVE', icon: '🚄' },
];

const faqData = [
  {
    question: '¿Es online o presencial?',
    answer: 'Es completamente presencial. Debes estar físicamente en la Zona Vialia (Estación María Zambrano) para resolver las pruebas. Cada enigma requiere observación directa del entorno.'
  },
  {
    question: '¿Puedo jugar solo?',
    answer: 'Sí, puedes jugar solo o en equipo. La aventura se adapta tanto a aventureros solitarios como a grupos de hasta 6 personas.'
  },
  {
    question: '¿Dónde empieza el juego?',
    answer: 'El juego comienza cuando inicias el chat con el Maestro de los Enigmas en cualquier lugar de la Zona Vialia. Él te dará las primeras instrucciones y te indicará dónde empezar a buscar.'
  },
  {
    question: '¿Cuánto cuesta participar?',
    answer: 'El precio varía según el tamaño del grupo y la temporada. Contacta directamente para obtener información actualizada sobre tarifas y descuentos disponibles.'
  },
  {
    question: '¿Qué necesito llevar?',
    answer: 'Solo necesitas tu móvil con batería y conexión a internet, y muchas ganas de resolver misterios. Al ser en la estación, no necesitas caminar grandes distancias.'
  },
  {
    question: '¿Hay límite de edad?',
    answer: 'La experiencia está diseñada para mayores de 16 años. Los menores deben ir acompañados de un adulto. Los enigmas requieren cierto nivel de cultura general.'
  },
  {
    question: '¿Qué pasa si me quedo atascado?',
    answer: 'El Maestro de los Enigmas puede darte pistas si llevas mucho tiempo sin avanzar, pero nunca te dará la respuesta directamente. Esa es parte del desafío.'
  },
  {
    question: '¿Funciona en cualquier momento?',
    answer: 'La experiencia está disponible durante las horas de luz para que puedas ver bien los detalles. Te recomendamos evitar días de lluvia intensa.'
  },
  {
    question: '¿Qué pasa si me quedo atascado?',
    answer: 'Para cualquier emergencia o atención especial contactad con el Guardián escribiéndole a su whatsapp.'
  }
];

interface SavedSession {
  groupName: string;
  score: number;
  level: string;
  puzzles: number;
  lastPlayed: number;
}

export default function MalagaQuest() {
  const [showChat, setShowChat] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentSection, setCurrentSection] = useState('home');
  const [groupName, setGroupName] = useState('');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);

  // Detectar sesiones guardadas
  useEffect(() => {
    const detectSavedSessions = () => {
      const sessions: SavedSession[] = [];

      // Buscar todas las claves que empiecen con 'malaga-quest-vialia-'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('malaga-quest-vialia-') && !key.includes('-score') && !key.includes('-level') && !key.includes('-puzzles')) {
          const groupName = key.replace('malaga-quest-vialia-', '');
          const messagesData = localStorage.getItem(key);
          const scoreData = localStorage.getItem(`malaga-quest-vialia-${groupName}-score`);
          const levelData = localStorage.getItem(`malaga-quest-vialia-${groupName}-level`);
          const puzzlesData = localStorage.getItem(`malaga-quest-vialia-${groupName}-puzzles`);

          if (messagesData) {
            try {
              const messages = JSON.parse(messagesData);
              if (messages.length > 1) { // Más que solo el mensaje de bienvenida
                const lastMessage = messages[messages.length - 1];

                sessions.push({
                  groupName,
                  score: scoreData ? parseInt(scoreData) : 0,
                  level: levelData || 'Novato Perdido',
                  puzzles: puzzlesData ? parseInt(puzzlesData) : 0,
                  lastPlayed: lastMessage.timestamp || Date.now()
                });
              }
            } catch (error) {
              console.error('Error parsing saved session:', error);
            }
          }
        }
      }

      // Ordenar por última vez jugado (más reciente primero)
      sessions.sort((a, b) => b.lastPlayed - a.lastPlayed);
      setSavedSessions(sessions);
    };

    detectSavedSessions();
  }, []);

  // Manejar cuenta regresiva
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      // Después de la cuenta regresiva, mostrar el chat
      setShowCountdown(false);
      setShowChat(true);
      setCountdown(3); // Reset para próxima vez
    }
  }, [showCountdown, countdown]);

  const startAdventure = () => {
    if (!groupName.trim()) {
      alert('Por favor, ingresa el nombre de tu grupo para comenzar la aventura.');
      return;
    }
    setSelectedSession(null);
    setShowCountdown(true);
  };

  const continueSession = (session: SavedSession) => {
    setGroupName(session.groupName);
    setSelectedSession(session);
    setShowChat(true);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  // Pantalla de cuenta regresiva
  if (showCountdown) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="floating-icons" />

        <div className="text-center space-y-8 animate-in fade-in duration-500">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-primary mb-8">
              🌀 Entrando al Portal Místico...
            </h2>

            <div className="relative">
              {countdown > 0 ? (
                <div className="text-8xl md:text-9xl font-bold text-primary mystical-glow animate-pulse">
                  {countdown}
                </div>
              ) : (
                <div className="text-4xl text-accent golden-glow animate-pulse">
                  ✨ ¡Portal Activado! ✨
                </div>
              )}
            </div>

            <p className="text-xl text-muted-foreground">
              {countdown > 0 ? 'Preparando los enigmas...' : 'Conectando con el Maestro de los Enigmas...'}
            </p>
          </div>
        </div>

        {/* Efectos visuales de portal */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 border-4 border-primary/20 rounded-full animate-ping"></div>
            <div className="absolute top-8 left-8 w-80 h-80 border-2 border-accent/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-16 left-16 w-64 h-64 border border-primary/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (showChat) {
    return (
      <div className="min-h-screen relative">
        <div className="floating-icons" />
        <ChatComponent groupName={groupName} onClose={() => setShowChat(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="floating-icons" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary mystical-glow">
              🚂 Málaga Quest
            </h1>
            <h2 className="text-2xl md:text-3xl text-accent golden-glow">
              Zona Vialia - Aventura Urbana
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              ¿Preparado para descubrir los secretos de la Zona Vialia?
              <span className="text-primary font-semibold"> Málaga Quest - Zona Vialia</span> te lleva por una
              aventura urbana única en el corazón de la estación. Observa, deduce, interactúa…
              y resuelve los enigmas que solo el <span className="text-accent">Maestro de los Enigmas</span> puede desvelar.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full">
                🚂 Zona Vialia
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full">
                🤖 Guiado por IA
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full">
                🧩 9 Pruebas Únicas
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full">
                ⏱️ 1-2 horas
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center max-w-md mx-auto">
            <div className="w-full">
              <Input
                type="text"
                placeholder="Nombre de tu grupo (ej: Los Exploradores)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3 text-lg text-center bg-card/80 border-primary/30 text-foreground placeholder-muted-foreground rounded-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={startAdventure}
                size="lg"
                className="mystical-glow bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-xl font-bold transform hover:scale-105 transition-all duration-300 rounded-full flex-1"
              >
                👣 Comenzar la Aventura
              </Button>

              {/* Botón de Recuperar Partida - Solo si hay sesiones guardadas */}
              {savedSessions.length > 0 && (
                <div className="flex flex-col gap-2 flex-1">
                  <Button
                    onClick={() => setCurrentSection(currentSection === 'recovery' ? 'home' : 'recovery')}
                    size="lg"
                    variant="outline"
                    className="bg-accent/20 border-accent text-accent hover:bg-accent/30 px-8 py-6 text-lg font-bold rounded-full"
                  >
                    🔄 Recuperar Partida
                  </Button>
                </div>
              )}
            </div>

            {/* Panel de Recuperar Partida */}
            {currentSection === 'recovery' && savedSessions.length > 0 && (
              <Card className="w-full mt-4 bg-card/90 backdrop-blur-sm border-accent/30">
                <CardHeader>
                  <CardTitle className="text-center text-accent">
                    🎮 Partidas Guardadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {savedSessions.slice(0, 3).map((session, index) => (
                    <div
                      key={session.groupName}
                      className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-accent/20 hover:border-accent/40 transition-colors cursor-pointer"
                      onClick={() => continueSession(session)}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{session.groupName}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeAgo(session.lastPlayed)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-yellow-600/20 text-yellow-200">
                          💰 {session.score}
                        </Badge>
                        <Badge variant="outline" className="bg-green-600/20 text-green-200">
                          🧩 {session.puzzles}/12
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => setCurrentSection('home')}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Indicador de más contenido */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="animate-bounce">
              <div className="text-accent text-2xl mb-2">⬇️</div>
              <p className="text-sm text-muted-foreground">Descubre más misterios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section as Accordion */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="map" className="border border-accent/30 rounded-3xl px-6 mb-4">
              <AccordionTrigger className="text-2xl font-bold text-primary hover:text-accent">
                🚂 Los 9 Secretos de Vialia
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <p className="text-xl text-muted-foreground mb-8 text-center">
                  Cada rincón de la estación guarda un misterio. ¿Podrás resolverlos todos?
                </p>
                <MapComponent locations={locations} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Features Section as Accordion */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="features" className="border border-accent/30 rounded-3xl px-6 mb-4">
              <AccordionTrigger className="text-2xl font-bold text-primary hover:text-accent">
                ⚔️ Tu Aventura Épica
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="mystical-glow bg-card/90 backdrop-blur-sm oval-card">
                    <CardHeader>
                      <CardTitle className="text-center text-2xl text-accent">
                        🎭 Maestro de los Enigmas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-center text-muted-foreground">
                        Un guía divertido y encantador que te llevará por los rincones de Vialia.
                        Bromista pero desafiante, te hará pensar y reír a partes iguales.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="golden-glow bg-card/90 backdrop-blur-sm oval-card">
                    <CardHeader>
                      <CardTitle className="text-center text-2xl text-primary">
                        🚂 Zona Vialia Real
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-center text-muted-foreground">
                        Explora la moderna estación María Zambrano. Cada prueba requiere que estés
                        físicamente en el lugar y observes los detalles del entorno urbano.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="mystical-glow bg-card/90 backdrop-blur-sm oval-card">
                    <CardHeader>
                      <CardTitle className="text-center text-2xl text-accent">
                        🔍 Enigmas Urbanos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-center text-muted-foreground">
                        Observa arquitectura, cuenta elementos, descifra símbolos.
                        Cada desafío te conecta con la historia moderna de Málaga.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* FAQ Section as Accordion */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              ❓ Preguntas Frecuentes
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-accent/30 rounded-3xl px-6 bg-card/90 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-lg text-accent hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/20 to-accent/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-primary">
            🚂 ¿Listo para la Aventura?
          </h2>
          <p className="text-xl text-foreground/90">
            El Maestro de los Enigmas te está esperando en Vialia. Descubre los secretos urbanos que solo los observadores pueden encontrar.
          </p>
          <Button
            onClick={startAdventure}
            size="lg"
            className="mystical-glow bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-2xl font-bold transform hover:scale-105 transition-all duration-300 rounded-full"
          >
            🎮 ¡Empezar Ahora!
          </Button>
        </div>
      </section>

    </div>
  );
}
