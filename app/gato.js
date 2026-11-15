// Contenido de Maese Ronroneo, el gato del mercado: cartas, consejos y datos curiosos.
// Para añadir más, basta con agregar líneas a estas listas.
(function (root) {
  // Los 22 arcanos mayores del tarot, con su lectura "para tu bolsa".
  const CARTAS = [
    ['0', 'El Loco', 'Un nuevo comienzo. Cuidado con los saltos al vacío… y con las compras por impulso.'],
    ['I', 'El Mago', 'Tienes más recursos de los que crees. Úsalos con ingenio antes de gastar más.'],
    ['II', 'La Sacerdotisa', 'Escucha tu intuición: antes de comprar, pregúntate si de verdad lo necesitas.'],
    ['III', 'La Emperatriz', 'La abundancia se cultiva. Tu ahorro crece si lo riegas un poco cada mes.'],
    ['IV', 'El Emperador', 'Orden y estructura. Es un buen momento para revisar tu presupuesto.'],
    ['V', 'El Hierofante', 'La sabiduría de siempre: gasta menos de lo que ganas.'],
    ['VI', 'Los Enamorados', 'Una elección te espera. Entre dos compras, a veces la mejor es ninguna.'],
    ['VII', 'El Carro', 'Avanza con determinación hacia tu meta de ahorro. Nada te detiene.'],
    ['VIII', 'La Fuerza', 'Domina al tigre de los antojos con paciencia, no con fuerza bruta.'],
    ['IX', 'El Ermitaño', 'Momento de introspección: repasa tus gastos en calma, sin culpas.'],
    ['X', 'La Rueda de la Fortuna', 'Los ciclos cambian. Ten un colchón para cuando la rueda gire.'],
    ['XI', 'La Justicia', 'Equilibrio entre lo que entra y lo que sale. La balanza no miente.'],
    ['XII', 'El Colgado', 'A veces esperar es la mejor inversión. Deja reposar esa compra.'],
    ['XIII', 'La Muerte', '¿Otra vez la Muerte? Tranquilo: significa transformación. Despide un mal hábito de gasto.'],
    ['XIV', 'La Templanza', 'Moderación: ni tacaño ni derrochador. El punto medio es oro.'],
    ['XV', 'El Diablo', 'Cuidado con las tentaciones y con las cuotas que te atan durante meses.'],
    ['XVI', 'La Torre', 'Lo inesperado llega. Para eso existe el fondo de emergencia.'],
    ['XVII', 'La Estrella', 'Esperanza: tus metas están más cerca de lo que parece.'],
    ['XVIII', 'La Luna', 'No todo es lo que parece. Lee la letra pequeña antes de firmar.'],
    ['XIX', 'El Sol', 'Claridad y éxito. Celebra tus logros… con moderación.'],
    ['XX', 'El Juicio', 'Hora de evaluar tu mes y decidir qué cambiar.'],
    ['XXI', 'El Mundo', 'Un ciclo completo. Cada meta cumplida abre la puerta a otra.']
  ];

  // Datos curiosos del mundo.
  const DATOS = [
    'Los pulpos tienen tres corazones y la sangre azul.',
    'Un día en Venus dura más que un año en Venus: gira muy despacio sobre sí mismo.',
    'Los plátanos son ligeramente radiactivos por el potasio que contienen. Tranquilo, harían falta millones para que fuera peligroso.',
    'El animal nacional de Escocia es el unicornio.',
    'La Gran Muralla China no se ve a simple vista desde la Luna.',
    'Los tiburones existían antes que los árboles: hay tiburones desde hace unos 450 millones de años.',
    'Un rayo puede estar unas cinco veces más caliente que la superficie del Sol.',
    'Los flamencos son rosados por los pigmentos de las algas y crustáceos que comen.',
    'Australia es más ancha que la Luna: mide unos 4.000 km de este a oeste y la Luna, unos 3.475 km de diámetro.',
    'El euro empezó a circular en billetes y monedas el 1 de enero de 2002.',
    'Las primeras monedas conocidas se acuñaron en Lidia, en la actual Turquía, hace unos 2.600 años.',
    'Los primeros billetes de papel se usaron en China hace casi mil años.',
    'La palabra «salario» viene del latín «salarium», relacionada con la sal, que en Roma era muy valiosa.',
    'La palabra «banco» viene de los bancos o mesas donde trabajaban los cambistas italianos.',
    'El símbolo del euro, €, se inspira en la letra griega épsilon.',
    'Las monedas de euro tienen una cara común y otra distinta según el país que las acuña.',
    'Los mayas y los aztecas usaban granos de cacao como moneda.',
    'Una de las primeras tarjetas de crédito modernas fue la de Diners Club, en 1950.',
    'Los gatos duermen entre 12 y 16 horas al día. Yo, por ejemplo, solo despierto para leer cartas.',
    'Los gatos no pueden saborear lo dulce: les falta el receptor de ese sabor.',
    'Cada oreja de un gato tiene unos 32 músculos.',
    'El Vaticano es el país más pequeño del mundo: mide menos de medio kilómetro cuadrado.',
    'Italia es uno de los países con más lugares Patrimonio de la Humanidad.',
    'La Torre Eiffel puede crecer unos 15 cm en verano porque el metal se dilata con el calor.',
    'El monte Everest sigue creciendo unos milímetros cada año.',
    'Los koalas pueden dormir unas 20 horas al día.',
    'Saturno es menos denso que el agua: en una bañera gigante, flotaría.',
    'El desierto más grande del mundo es la Antártida: allí casi no llueve ni nieva.',
    'Los colibríes pueden volar hacia atrás.',
    'Una cucharadita de una estrella de neutrones pesaría miles de millones de toneladas.',
    'Las nutrias marinas se toman de las patas al dormir para que la corriente no las separe.',
    'Los cuervos pueden reconocer y recordar rostros humanos.',
    'La Luna se aleja de la Tierra unos 3,8 cm cada año.',
    'Rusia tiene 11 husos horarios.',
    'Canadá tiene alrededor del 60% de los lagos del mundo.',
    'Las jirafas tienen las mismas vértebras en el cuello que los humanos: siete.',
    'La Gran Pirámide de Guiza fue la construcción humana más alta durante unos 3.800 años.',
    'Los pingüinos emperador pueden bucear a más de 500 metros de profundidad.',
    'Venecia se levanta sobre millones de pilotes de madera clavados en el fondo de la laguna.',
    'Según la tradición, la pizza Margarita debe su nombre a la reina Margarita de Saboya.',
    'Islandia es uno de los pocos lugares del mundo sin mosquitos.',
    'Las abejas se comunican la ubicación de las flores con una danza.',
    'El corazón de una ballena azul puede pesar más de 150 kg.',
    'Hay más estrellas en el universo observable que granos de arena en todas las playas de la Tierra.'
  ];

  // Consejos de ahorro generales.
  const CONSEJOS = [
    'Prueba la regla 50/30/20: 50% para lo necesario, 30% para tus gustos y 20% para ahorrar.',
    'Antes de una compra no planificada, espera 24 horas. Si mañana aún la quieres, adelante.',
    'Págate primero a ti: aparta tu ahorro el día que cobras, no lo que sobre a fin de mes.',
    'Un fondo de emergencia de 3 a 6 meses de gastos te protege de las sorpresas.',
    'Ve al supermercado con lista… y sin hambre.',
    'Compara el precio por kilo o por litro, no el del paquete.',
    'Las marcas blancas suelen costar bastante menos por una calidad parecida.',
    'Llevar comida de casa unos días a la semana ahorra más de lo que parece.',
    'Revisa una vez al año tus tarifas de luz, gas, internet y móvil.',
    'Los pequeños gastos suman: 3 € al día son unos 90 € al mes.',
    'Vende lo que ya no uses: el desván también es un tesoro.',
    'Si usas mucho el transporte público, calcula si te sale a cuenta un abono mensual.',
    'Ponle nombre a tu ahorro («viaje», «colchón»): es más fácil cuidar una meta concreta.',
    'Desactiva las tarjetas guardadas en las tiendas online: un paso más frena los impulsos.'
  ];

  // Consejos según la categoría que más pesa en tu mes.
  const CONSEJOS_CATEGORIA = {
    'Comida': 'Tu mayor gasto es la comida. Planificar los menús de la semana evita compras de última hora.',
    'Salud': 'La salud es lo primero, pero pregunta siempre por el genérico en la farmacia: suele ser más barato.',
    'Transporte': 'El transporte se lleva mucho. ¿Algún trayecto se puede hacer andando, en bici o compartido?',
    'Tiempo libre': 'El ocio domina tu mes. Busca planes gratuitos: museos con entrada libre, parques, rutas.',
    'Hogar/Servicios': 'Los servicios del hogar pesan. Revisa si tu tarifa de luz o de móvil sigue siendo la mejor.',
    'Suscripciones': 'Las suscripciones suman. ¿Usas todas? Pausa las que no hayas abierto este mes.',
    'Otros': 'Mucho va a «Otros». Clasifica esos gastos: lo que se nombra, se controla.'
  };

  root.Gato = { CARTAS, DATOS, CONSEJOS, CONSEJOS_CATEGORIA };
})(window);
