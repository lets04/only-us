import { Gift, HeartHandshake, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { PageIntro, Notice } from '../components/ui'

export function CardsPage() {
  const [opened, setOpened] = useState(false)
  return <div className="page"><PageIntro eyebrow="Cartas" title="Palabras para guardar cerca.">Notas provisionales y editables: cámbialas por nuestras propias palabras antes de convertirlas en recuerdo.</PageIntro>
    <Notice>Estos textos son una propuesta de estructura, no mensajes personales auténticos.</Notice>
    <section className="letter-layout"><article className="letter-paper"><div className="letter-paper__seal">OU</div><p className="letter-date">23 de junio · aniversario</p><h2>Para mi persona favorita,</h2><p>Este es un texto provisional para que puedas empezar una carta. Aquí podemos dejar las cosas pequeñas que normalmente se dicen rápido, las que merecen leerse despacio.</p><p>Gracias por cada conversación, cada plan y cada espacio compartido. Que esta página sea solo el principio de muchas más historias por escribir.</p><p className="letter-signature">Con cariño,<br />[tu nombre]</p></article>
      <div className="message-stack"><article><HeartHandshake size={20} /><p>“Un lugar para una nota corta que quieras volver a encontrar cualquier día.”</p><span>Mensaje editable</span></article><article><Sparkles size={20} /><p>“Aquí puede vivir una promesa, una idea o algo que nos haga sonreír a los dos.”</p><span>Mensaje editable</span></article></div></section>
    <section className={`surprise ${opened ? 'surprise--open' : ''}`}><Gift size={22} /><div><p className="eyebrow">Una pequeña sorpresa</p><h2>{opened ? 'Todavía quedan muchas páginas por llenar.' : 'Hay algo esperándote.'}</h2><p>{opened ? 'El mejor regalo es seguir creando recuerdos que solo tengan sentido para nosotros.' : 'Una interacción sencilla para convertir en nuestro mensaje secreto.'}</p></div><button className="button button--primary" onClick={() => setOpened(!opened)}>{opened ? 'Cerrar sorpresa' : 'Abrir sorpresa'}</button></section>
  </div>
}
