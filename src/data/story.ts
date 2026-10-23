import type { Memory, StorySettings } from '../types/models'

export const FIRST_STORY_MEMORY_ID = '8f3c1a2e-6b47-4c91-9e0d-24a6c5b17d01'

export const defaultStory: StorySettings = {
  title: 'Nuestra historia',
  subtitle: 'De no soportarnos a enamorarnos poquito a poquito',
  relationshipStartDate: '2025-06-23',
  introText: `Si me hubieran dicho cuando nos conocimos que iba a terminar enamorándome de ti, creo que no lo habría creído. Al principio hasta te llegué a odiar por ese malentendido que tuvimos en una llamada, cuando todavía éramos amigos. Y ahora me da risa pensar que todo empezó así, porque terminaste siendo una de las personas más importantes para mí.

Después empezamos a hablar cada vez más, hasta que hacer llamadas todos los días se volvió algo normal para nosotros. Me fui acostumbrando a escucharte, a contarte mis cosas y a conocer más de ti. Con cada llamada fui descubriendo la persona que eres, y sin darme cuenta empecé a quererte de una forma diferente.

No recuerdo el momento exacto en el que me enamoré. Creo que simplemente pasó. Cada día quería hablar un poquito más contigo y me hacía feliz tenerte en mi día, aunque fuera a través de una pantalla. Hasta que un día entendí que eras la persona que más quería y que ya me gustabas muchísimo.

La verdad, al principio tenía miedo de empezar una relación. Pero también tenía muchas ganas de intentarlo contigo, así que decidí darme esa oportunidad y ver qué podíamos construir juntos.

El 23 de junio de 2025 nos hicimos novios. Ese día empezó oficialmente lo nuestro, y aunque en ese momento no sabía todo lo que nos esperaba, me alegra que hayamos decidido intentarlo.

El 24 de junio, apenas un día después, ya quería guardar una foto nuestra. Quería tener algo de ese primer día siendo pareja, una pequeña forma de recordar cómo empezó todo. Por eso esa foto tiene un lugar especial en nuestra historia.

Después vinieron nuestras salidas a comer, las videollamadas para ver películas cuando no podíamos estar juntos, las llamadas en las que nos mostrábamos nuestros cuartos y tantas otras cosas que nos ayudaron a conocernos más. Puede que para otras personas sean detalles simples, pero para mí son recuerdos bonitos porque los compartí contigo.

Obviamente, no todo ha sido bonito ni siempre nos hemos entendido. También hemos pasado por momentos difíciles y hemos tenido problemas. Pero seguimos aquí, aprendiendo de lo que nos pasa y tratando de querernos mejor. No quiero que nuestra historia parezca perfecta, porque no lo es; quiero recordar lo bueno, reconocer lo que nos ha costado y valorar que los dos hemos decidido seguir construyendo algo juntos.

Mi amorcito, me gusta pensar en todo lo que hemos vivido desde aquellas primeras llamadas hasta ahora. A veces me cuesta creer que la persona que al principio no soportaba se haya convertido en alguien a quien quiero tanto. Qué vueltas da la vida, ¿no?

Todavía nos faltan muchas fotos por guardar, canciones que dedicar, películas por ver y recuerdos que ni siquiera imaginamos todavía. Quiero que este pequeño espacio sea para eso: para guardar nuestras cosas, nuestras anécdotas y esos momentos que quizá parezcan chiquitos, pero que para nosotros significan mucho.

Te amo, mi pedacito de cielo. Y me alegra que, entre tantas personas, nos hayamos encontrado tú y yo.`,
}

export const firstStoryMemory: Memory = {
  id: FIRST_STORY_MEMORY_ID,
  title: 'Día 1 — Un día después de convertirnos en nosotros',
  date: '2025-06-24',
  description: 'Apenas llevábamos un día siendo novios y yo ya quería guardar una foto nuestra. Qué bonito poder recordar nuestro comienzo.',
  sortOrder: 1,
  isVisible: true,
  showInCarousel: false,
  showInStory: true,
}
