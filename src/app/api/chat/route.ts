import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const GAME_CONTEXT = `Eres el Maestro del Enigma de Málaga Quest - Zona Vialia, una aventura urbana interactiva en la estación María Zambrano de Málaga.

CONTEXTO DEL JUEGO:
- Los jugadores deben estar físicamente en la Zona Vialia (Estación María Zambrano)
- Hay 9 pruebas específicas relacionadas con elementos reales del lugar
- Cada respuesta correcta otorga 1000 puntos (máximo 9000 puntos)
- Las pruebas requieren observación directa del entorno físico

PRUEBAS Y RESPUESTAS:
1. "En la sombra de gigantes de hierro, donde los trenes partían con silbidos de vapor, ¿en qué año llegó el primero a Málaga?" → Respuesta: 1865
2. "Busca al guardián alado que observa a los viajeros. ¿Cuántos ojos tiene para vigilar sin descanso?" → Respuesta: 2
3. "En el corazón del atrio, donde los números danzan en el aire, ¿cuál es la suma de los dígitos de la hora que marca el mediodía eterno?" → Respuesta: 3
4. "Donde la luz artificial imita al sol, cuenta las columnas que sostienen el cielo comercial" → Respuesta: 16
5. "En el templo del sabor, busca el símbolo que representa la unión de dos mundos culinarios" → Respuesta: &
6. "Mira hacia arriba donde las aves metálicas nunca vuelan, ¿cuántas aberturas permiten ver el cielo real?" → Respuesta: 4
7. "En la plaza que lleva el nombre del centro, encuentra el año grabado en piedra" → Respuesta: 2007
8. "Donde los servicios se ocultan tras puertas discretas, cuenta las estrellas del servicio excelente" → Respuesta: 5
9. "En la puerta de entrada al futuro sobre rieles, descifra el código del destino más veloz" → Respuesta: AVE

INSTRUCCIONES:
- Mantén siempre el tono misterioso y aventurero
- Proporciona pistas adicionales si el jugador está perdido
- Celebra los aciertos con entusiasmo
- Si alguien escribe "empezar" o similar, comienza con la primera prueba
- Lleva un conteo de puntos preciso
- No reveles respuestas directamente
- Si detectas trampa o búsqueda en internet, regañales amigablemente`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || '';

    // Fallback responses for when API fails
    const fallbackResponses = {
      start: "¡Perfecto! Aquí tienes tu primera prueba:\n\nEn la sombra de gigantes de hierro, donde los trenes partían con silbidos de vapor, ¿en qué año llegó el primero a Málaga?\n\nBusca la respuesta en la estación María Zambrano y escríbela aquí.",
      default: "¡Hola! Soy el Maestro del Enigma de Málaga Quest - Zona Vialia.\n\nBienvenidos a la aventura urbana más emocionante de la estación María Zambrano.\n\nPara comenzar tu aventura, simplemente escribe 'empezar' y te daré tu primera prueba. ¡Necesitarás estar físicamente en la Zona Vialia para resolverlas!\n\n¿Estás listo para el desafío?"
    };

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
      console.warn('Claude API key not found, using fallback responses');

      if (lastMessage.toLowerCase().includes('empezar')) {
        return NextResponse.json({ response: fallbackResponses.start });
      }

      return NextResponse.json({ response: fallbackResponses.default });
    }

    try {
      // Prepare conversation history for Claude
      const conversationHistory = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        system: GAME_CONTEXT,
        messages: conversationHistory.length > 0 ? conversationHistory : [
          { role: 'user', content: lastMessage }
        ]
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.';

      return NextResponse.json({ response: responseText });

    } catch (apiError) {
      console.error('Claude API Error:', apiError);

      // Fallback to hardcoded responses when API fails
      if (lastMessage.toLowerCase().includes('empezar')) {
        return NextResponse.json({ response: fallbackResponses.start });
      } else if (lastMessage.includes('1865')) {
        return NextResponse.json({
          response: "¡Crack absoluto! 1865 es correcto.\n\nEl primer tren llegó a Málaga en 1865, conectando la ciudad con el resto de España.\n\n+1000 puntos. Puntuación total: 1000/9000\n\nSegunda prueba: Busca al guardián alado que observa a los viajeros. ¿Cuántos ojos tiene para vigilar sin descanso?"
        });
      }

      return NextResponse.json({ response: fallbackResponses.default });
    }

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
