import { Gift, HeartHandshake, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageIntro } from "../components/ui";

export function CardsPage() {
  const [opened, setOpened] = useState(false);

  return (
    <div className="page">
      <PageIntro eyebrow="Cartitas" title="Unas cositas que quiero decirte.">
        Porque hay cosas que siento por ti que a veces no sé cómo decirte, pero
        que quiero que siempre recuerdes.
      </PageIntro>
      <section className="letter-layout">
        <article className="letter-paper">
          <div className="letter-paper__seal">♡</div>
          <p className="letter-date">Para mi amorcito</p>
          <h2>Mi amor,</h2>

          <p>
            A veces me pongo a recordar cómo empezó todo lo nuestro y me parece
            tan bonito pensar que, entre tantos paseos, conversaciones y
            momentos que parecían cualquier cosa, terminaste convirtiéndote en
            alguien tan importante para mí. Quién diría que aquel que me dijo
            que si quería lanzarme era que solo le diga jajaj terminaría siendo
            mi novio. ♡
          </p>

          <p>
            Me gusta tenerte en mi vida, compartir mis días contigo y seguir
            creando recuerdos que después podamos mirar y decir: "¿Te acuerdas
            de esto?". Sé que no todos los días son perfectos y que a veces
            tenemos nuestras cositas, pero también sé que quiero seguir
            compartiendo muchas cosas contigo.
          </p>

          <p>
            No quiero que se nos olvide lo bonito que fue empezar, todo lo que
            sentimos y cada pequeño momento que nos trajo hasta aquí.
          </p>

          <p className="letter-signature">Te amo mucho, mi amorcito. ♡</p>
        </article>

        <div className="message-stack">
          <article>
            <HeartHandshake size={20} />
            <p>
              “Y pensar que al principio ni siquiera imaginaba todo lo que ibas
              a significar para mí.”
            </p>
            <span>De nuestro comienzo ♡</span>
          </article>

          <article>
            <Sparkles size={20} />
            <p>
              “Quiero seguir teniendo recuerdos contigo, de esos que después nos
              hacen sonreír cuando los contamos.”
            </p>
            <span>Para nuestro futuro</span>
          </article>
        </div>
      </section>

      <section className={"surprise " + (opened ? "surprise--open" : "")}>
        <Gift size={22} />
        <div>
          <p className="eyebrow">Solo para ti</p>
          <h2>
            {opened
              ? "Te mando muchos besitos, mi amor."
              : "Tengo algo para ti ♡"}
          </h2>
          <p>
            {opened
              ? "Ojalá pudiera estar contigo ahora mismo para abrazarte, llenarte de besitos y quedarme un ratito más a tu lado."
              : "Abre esto cuando quieras recibir un poquito de amor de mi parte."}
          </p>
        </div>
        <button
          className="button button--primary"
          onClick={() => setOpened(!opened)}
        >
          {opened ? "Cerrar mi mensajito" : "Abrir mi mensajito"}
        </button>
      </section>
    </div>
  );
}
