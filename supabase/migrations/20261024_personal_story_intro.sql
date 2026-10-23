-- OnlyUs: personalize the default story intro without overwriting the couple's edits.
-- Apply after 20261023_story_photos_songs.sql.
-- This updates only the untouched original seed text. Any intro already edited in the app is preserved.

update public.story_settings
set intro_text = $story$Había una vez dos personas muy distintas, cada una con su propia vida, sus propias historias y sus propios momentos. Ninguna sabía que, entre tantas vueltas de la vida, estaba a punto de conocer a alguien que terminaría significando tanto.

Nos conocimos a principios de 2025 y, si alguien me hubiera dicho en ese entonces que terminaría enamorándome de él, probablemente no lo habría creído. De hecho, al principio llegué a odiarlo por un malentendido durante una llamada, cuando todavía éramos amigos. Qué curioso pensar que la persona que un día me hizo enojar tanto terminaría convirtiéndose en una de las personas que más quiero en este mundo.

Pero la vida tenía otros planes para nosotros.

De a poquito empezamos a hablar más, hasta que las llamadas se volvieron parte de nuestros días. Entre conversaciones, risas y llamadas que parecían no terminar, fui descubriendo a la persona tan increíble que había detrás de todo aquello. Empezamos a conocernos de una manera muy bonita y profunda, compartiendo cada vez más de nuestros mundos.

No sé exactamente en qué momento pasó. No hubo un día en el que decidiera enamorarme de él. Simplemente empezó a pasar. Un día quería hablar con él un ratito más; después esperaba con ilusión nuestras llamadas, y luego me di cuenta de que cualquier cosa era más bonita cuando podía compartirla con él.

Hasta que un día desperté y entendí que ya lo quería muchísimo, que me gustaba más de lo que imaginaba y que, sin buscarlo, se había convertido en esa personita que ocupaba un lugar enorme en mi corazón.

Y sí, tenía miedo. Empezar algo tan bonito también daba miedo, porque cuando alguien empieza a importarte tanto, no quieres perderlo. Pero, aun con esos nervios y todas las dudas que podía tener al principio, había algo que tenía claro: quería intentarlo con él.

Y entonces llegó el 23 de junio de 2025. Ese día dejamos de ser solamente dos personas que se estaban conociendo y empezamos a escribir nuestra propia historia de amor. No sé si fueron las estrellas, el destino o simplemente la vida haciendo de las suyas, pero me gusta pensar que, entre tantas personas y tantos caminos posibles, de alguna manera nuestros caminos tenían que encontrarse.

Al día siguiente, el 24 de junio, quise tener una foto nuestra. Apenas había pasado un día desde que éramos novios y yo ya quería guardar ese pedacito de nuestra historia. Tal vez en ese momento no imaginaba todos los recuerdos que vendrían después, pero ahora me parece tan bonito tener una foto de nuestro primer día siendo pareja.

Después llegaron las salidas a comer, las videollamadas para ver películas cuando no podíamos estar juntos todo el tiempo, las veces en las que nos mostrábamos nuestros cuartos como una forma de dejar entrar al otro un poquito más en nuestro mundo, y todas esas pequeñas cosas que, aunque quizá parecían simples, para mí significaban muchísimo.

Poco a poco fuimos conociéndonos más, descubriendo nuestras formas de querer, compartiendo momentos bonitos y aprendiendo el uno del otro. Y así, sin darnos cuenta, fuimos construyendo algo nuestro. Algo que no se trata solamente de las fotos bonitas ni de los días felices, sino también de todo lo que hemos aprendido estando juntos.

Porque no todo siempre ha sido fácil. También hemos tenido momentos difíciles, problemas y días en los que las cosas no salían como queríamos. Pero, a pesar de todo, aquí seguimos. Hemos tenido nuestras razones para cansarnos, preocuparnos y tener miedo, pero también muchas razones para elegirnos y seguir intentando que lo nuestro funcione.

Y creo que eso también es amor: no que todo sea perfecto, sino que, incluso cuando las cosas se complican, todavía exista ese deseo de cuidarnos, entendernos y encontrar la manera de seguir adelante juntos.

Mi amorcito, mi vida, mi cielo, mi corazón, mi pedacito de cielo… mi futuro esposito. Si algún día volviera a vivir todo desde el principio, seguramente me reiría al recordar que al comienzo te odiaba por aquella llamada. Y después te buscaría otra vez en cada una de esas conversaciones, en cada risa y en cada momento que nos fue acercando.

Porque sin planearlo, sin darme cuenta y sin imaginar cuánto llegarías a importarme, terminaste convirtiéndote en alguien demasiado especial para mí.

Y esta historia todavía no termina. Nos faltan muchísimas fotos, más canciones, más lugares por conocer, más películas por ver juntos y muchísimos recuerdos que todavía no existen.

Por ahora, quiero guardar aquí todo lo que hemos sido, todo lo que somos y todo lo que todavía nos queda por vivir.

Feliz nuestro comienzo, mi pedacito de cielo. Te amo. Y qué bonito que, entre tantas casualidades, nos hayamos encontrado tú y yo.$story$
where id = 1
  and intro_text = $original$Nos conocimos a principios de 2025. Al principio llegué a odiarlo por un malentendido durante una llamada, cuando todavía éramos amigos. Después empezamos a hacer llamadas todos los días y nos fuimos conociendo de una manera bonita y profunda.

Con el tiempo descubrí la increíble persona que es y me enamoré de él poco a poco, sin darme cuenta. Un día entendí que era la persona que más quería. Al principio de la relación tenía miedo, pero también me gustaba muchísimo y decidí intentarlo con él.

El 23 de junio de 2025 nos hicimos novios.

Al día siguiente ya quería guardar una foto nuestra. Apenas llevábamos un día siendo pareja y yo sentía que ese comienzo merecía quedarse.

Después llegaron las salidas a comer, las videollamadas para ver películas cuando no podíamos estar juntos todo el tiempo, las llamadas en las que nos mostrábamos nuestros cuartos y tantas otras formas de irnos conociendo más.

Hemos vivido momentos bonitos y también momentos difíciles. A pesar de los problemas, hemos decidido seguir juntos y continuar aprendiendo a querernos mejor.

No todo ha sido perfecto. Nuestra historia está hecha de recuerdos, cariño, aprendizaje y de la decisión de seguir construyendo algo juntos.$original$;
