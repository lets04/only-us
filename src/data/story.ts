import type { Memory, StorySettings } from '../types/models'

export const FIRST_STORY_MEMORY_ID = '8f3c1a2e-6b47-4c91-9e0d-24a6c5b17d01'

export const defaultStory: StorySettings = {
  title: 'Nuestra historia',
  subtitle: 'De no soportarnos a convertirnos en el lugar seguro del otro',
  relationshipStartDate: '2025-06-23',
  introText: `Nos conocimos a principios de 2025. Al principio llegué a odiarlo por un malentendido durante una llamada, cuando todavía éramos amigos. Después empezamos a hacer llamadas todos los días y nos fuimos conociendo de una manera bonita y profunda.

Con el tiempo descubrí la increíble persona que es y me enamoré de él poco a poco, sin darme cuenta. Un día entendí que era la persona que más quería. Al principio de la relación tenía miedo, pero también me gustaba muchísimo y decidí intentarlo con él.

El 23 de junio de 2025 nos hicimos novios.

Al día siguiente ya quería guardar una foto nuestra. Apenas llevábamos un día siendo pareja y yo sentía que ese comienzo merecía quedarse.

Después llegaron las salidas a comer, las videollamadas para ver películas cuando no podíamos estar juntos todo el tiempo, las llamadas en las que nos mostrábamos nuestros cuartos y tantas otras formas de irnos conociendo más.

Hemos vivido momentos bonitos y también momentos difíciles. A pesar de los problemas, hemos decidido seguir juntos y continuar aprendiendo a querernos mejor.

No todo ha sido perfecto. Nuestra historia está hecha de recuerdos, cariño, aprendizaje y de la decisión de seguir construyendo algo juntos.`,
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
