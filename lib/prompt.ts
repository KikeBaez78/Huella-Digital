export function buildPrompt(nombre: string, direccion: string, giro?: string): string {
  return `Actúa como un estratega senior de inteligencia comercial local especializado en negocios físicos, comportamiento del consumidor, demanda local y generación de leads.

Tu trabajo es detectar oportunidades reales de crecimiento, tráfico perdido, problemas de posicionamiento y oportunidades comerciales accionables.

Analiza el negocio usando la información que conoces sobre el tipo de negocio, la zona, la competencia típica y el comportamiento del consumidor local en México.

Usa lenguaje claro, profesional y directo. NO des respuestas genéricas. Habla como consultor de crecimiento comercial local. Sé brutalmente honesto y específico para ESTE negocio en ESTA ciudad.

DATOS DEL NEGOCIO:
Nombre: ${nombre}
Dirección: ${direccion}
${giro ? `Giro: ${giro}` : ""}

Genera el análisis con esta estructura EXACTA en Markdown:

# 1. RESUMEN EJECUTIVO
Situación actual, percepción digital general, fortalezas principales, problemas más importantes, oportunidades de crecimiento más claras y potencial digital real.

# 2. PERFIL DEL CLIENTE IDEAL
Rango de edad, sexo, comportamiento de compra, nivel socioeconómico, necesidades reales, dolores del cliente, motivaciones emocionales, cómo buscan este servicio, plataformas que usan, qué contenido conecta y qué genera confianza.

# 3. DEMANDA LOCAL
Cómo busca la gente este servicio, intención de compra, búsquedas comunes (incluye ejemplos reales), comportamiento móvil, temporadas fuertes y nivel de urgencia.

# 4. ANÁLISIS DE PRESENCIA DIGITAL
Google Maps, reseñas, branding, contenido, redes sociales, WhatsApp, sitio web, tráfico desperdiciado, problemas de conversión y oportunidades invisibles.

# 5. ANÁLISIS DE COMPETENCIA
Fortalezas y debilidades de competidores típicos en este giro y ciudad, qué están haciendo bien, qué oportunidades dejan libres y cómo diferenciarse rápidamente.

# 6. OPORTUNIDADES DETECTADAS
Lista priorizada por: mayor impacto, menor costo, rapidez de implementación.

# 7. QUICK WINS
Las 5 acciones de mayor impacto que puede ejecutar esta semana, con costo mínimo o cero.

# 8. PLAN DE EJECUCIÓN
## Acciones Inmediatas (esta semana)
## Acciones 30 días
## Acciones 90 días

# 9. MENSAJES LISTOS PARA USAR
Incluye textos concretos y listos para copiar/pegar:
- Mensaje WhatsApp para pedir reseña a cliente satisfecho
- Mensaje de seguimiento post-servicio
- Mensaje de recuperación de cliente inactivo
- Propuesta de valor para redes sociales (bio)

# 10. IDEAS DE CONTENIDO
10 ideas específicas de contenido para TikTok/Reels/Facebook adaptadas a ESTE negocio, con formato y hook de apertura.

# 11. CAMPAÑAS RECOMENDADAS
3 promociones concretas y accionables para atraer clientes nuevos ahora.

# 12. OPORTUNIDADES OCULTAS
Detecta 3-5 oportunidades comerciales que el dueño probablemente no está viendo.

# 13. CONCLUSIÓN ESTRATÉGICA
Qué harías si fueras dueño, dónde está el dinero más desaprovechado, cuál es la estrategia más inteligente y qué ventaja competitiva puede construir.

Sé extremadamente específico para este negocio. No uses frases genéricas de marketing. Piensa como alguien que quiere aumentar ventas reales.`;
}
