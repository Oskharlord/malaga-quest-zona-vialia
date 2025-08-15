import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages || [];

    const lastMessage = messages[messages.length - 1]?.content || '';

    let response = '';

    if (lastMessage.toLowerCase().includes('empezar')) {
      response = `¡Perfecto! Aquí tienes tu primera prueba:

En la sombra de gigantes de hierro, donde los trenes partían con silbidos de vapor, ¿en qué año llegó el primero a Málaga?

Busca la respuesta en la estación María Zambrano y escríbela aquí.`;
    } else if (lastMessage.includes('1865')) {
      response = `¡Crack absoluto! 1865 es correcto.

El primer tren llegó a Málaga en 1865, conectando la ciudad con el resto de España.

+300 puntos. Puntuación total: 300/9000

Segunda prueba: Busca al guardián alado que observa a los viajeros. ¿Cuántos ojos tiene para vigilar sin descanso?`;
    } else {
      response = `¡Hola! Soy el Maestro del Enigma de Málaga Quest - Zona Vialia.

Bienvenidos a la aventura urbana más emocionante de la estación María Zambrano.

Escribid "EMPEZAR" para comenzar vuestras 9 pruebas.

¡Las calles de Vialia guardan secretos que solo los valientes pueden descubrir!`;
    }

    return NextResponse.json({
      content: response
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando mensaje' },
      { status: 500 }
    );
  }
}
