import { Gift, HeartHandshake, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { PageIntro } from '../components/ui'

export function CardsPage() {
  const [opened, setOpened] = useState(false)
  return <div className="page">
    <PageIntro eyebrow="Cartitas" title="Cosas que a veces no sé cómo decirte.">
      Para esos días en los que quiero recordarte lo mucho que significas para mí, aunque ya te lo diga mil veces.
    </PageIntro>
    <section className="letter-layout">
      <article className="letter-paper"><div className="letter-paper__seal">♡</div><p className="letter-date">Para mi amorcito</p><h2>Mi vida,</h2>
        <p>A veces me pongo a pensar en cómo empezó todo y todavía me da ternura que hayamos llegado hasta aquí. Lo nuestro no siempre ha sido fácil, pero me gusta que sigamos aprendiendo a entendernos y a querernos mejor.</p>
        <p>Gracias por las llamadas, las risas, los ratitos juntos y hasta por esos días en los que toca hablar las cosas con más calma. Quiero seguir guardando momentos contigo, de los grandes y de los que parecen pequeñitos.</p>
        <p className="letter-signature">Te amo,<br />tu pedacito de cielo ♡</p>
      </article>
      <div className="message-stack"><article><HeartHandshake size={20} /><p>“Qué bonito coincidir contigo y poder llamarte mi lugar seguro.”</p><span>Para cualquier día</span></article><article><Sparkles size={20} /><p>“No necesito que todo sea perfecto; quiero que sigamos eligiéndonos y aprendiendo juntos.”</p><span>Para no olvidarlo</span></article></div>
    </section>
    <section className={'surprise ' + (opened ? 'surprise--open' : '')}><Gift size={22} /><div><p className="eyebrow">Solo para ti</p><h2>{opened ? 'Te guardo un abrazo enorme, mi cielo.' : '¿Te dejo una cosita bonita?'}</h2><p>{opened ? 'Si estuvieras aquí, te abrazaría un ratito más y no te soltaría tan rápido.' : 'Hay palabras que siempre quiero que tengas cerquita.'}</p></div><button className="button button--primary" onClick={() => setOpened(!opened)}>{opened ? 'Guardar el abrazo' : 'Abrir mi mensajito'}</button></section>
  </div>
}
