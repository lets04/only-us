import {
  Bell,
  BellRing,
  Heart,
  LoaderCircle,
  Moon,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Notice } from "../components/ui";
import { supabase } from "../lib/supabase";

const wishes = [
  {
    id: "kisses",
    icon: "♡",
    title: "Quiero besitos",
    detail: "Un montón, por favor",
  },
  {
    id: "hugs",
    icon: "✧",
    title: "Quiero abrazos",
    detail: "De esos que duran mucho",
  },
  {
    id: "date",
    icon: "☾",
    title: "Una tarde juntos",
    detail: "Tú y yo, sin apuro",
  },
  {
    id: "call",
    icon: "✦",
    title: "Una videollamada",
    detail: "Quiero verte un ratito",
  },
  {
    id: "plan",
    icon: "❂",
    title: "Un plan sorpresa",
    detail: "Inventemos algo bonito",
  },
];
const responses = [
  "¡Voy por esos besitos!",
  "Agendemos nuestra tarde",
  "Te llamo en un ratito",
];

export function WishesPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [latest, setLatest] = useState<{
    id: string;
    wish_titles: string[];
    message: string;
    response: string | null;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState("");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      const { data, error } = await client
        .from("love_wishes")
        .select("id,wish_titles,message,response,created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (active) {
        if (data) setLatest(data as typeof latest);

        if (error) {
          setStatus(
            "Cuando apliques la migración de Antojitos de amor, podremos guardar las peticiones aquí.",
          );
        }

        setLoading(false);
      }
    };

    void load();

    const channel = client
      .channel("onlyus-love-wishes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "love_wishes" },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, []);

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const sendWish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected.length) {
      setStatus("Elige al menos un antojito para avisarle a tu amor. 💗");
      return;
    }
    if (!supabase) {
      setStatus(
        "Para enviar deseos de verdad, necesitamos la conexión con Supabase.",
      );
      return;
    }
    setSending(true);
    setStatus("");
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user)
        throw new Error(
          "Tu sesión venció. Entra de nuevo para enviar el deseo.",
        );
      const { data, error } = await supabase
        .from("love_wishes")
        .insert({
          sender_id: userData.user.id,
          wish_titles: wishes
            .filter((w) => selected.includes(w.id))
            .map((w) => w.title),
          message: message.trim(),
        })
        .select("id,wish_titles,message,response,created_at")
        .single();
      if (error)
        throw new Error(
          "No se pudo enviar. Aplica la migración de Antojitos de amor en Supabase y vuelve a probar.",
        );
      setLatest(data as typeof latest);
      setStatus("Tu deseo ya quedó guardado para que tu amor lo vea. ✨");
      setSelected([]);
      setMessage("");
      const { error: notificationError } = await supabase.functions.invoke(
        "send-wish-notification",
        { body: { wishId: data.id } },
      );
      if (notificationError)
        setPushStatus(
          "El deseo se guardó, pero el aviso push todavía no está configurado. Activa las notificaciones y revisa la configuración del servidor.",
        );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "No se pudo enviar el deseo.",
      );
    } finally {
      setSending(false);
    }
  };
  const enablePush = async () => {
    if (!supabase) {
      setPushStatus("Conecta Supabase para registrar las notificaciones.");
      return;
    }
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setPushStatus(
        "Este navegador no admite notificaciones push. Prueba con Chrome en Android después de publicar OnlyUs en Vercel.",
      );
      return;
    }
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as
      | string
      | undefined;
    if (!publicKey) {
      setPushStatus(
        "Falta VITE_VAPID_PUBLIC_KEY en el entorno de la aplicación.",
      );
      return;
    }
    setPushBusy(true);
    setPushStatus("");
    try {
      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();
      if (permission !== "granted")
        throw new Error(
          "Necesitas permitir las notificaciones para recibir mensajitos con OnlyUs cerrado.",
        );
      const registration = await navigator.serviceWorker.register("/sw.js");
      const ready = await navigator.serviceWorker.ready;
      const decodeKey = (key: string) => {
        const normalized = key.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(
          Math.ceil(normalized.length / 4) * 4,
          "=",
        );
        return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
      };
      let subscription = await ready.pushManager.getSubscription();
      if (!subscription)
        subscription = await ready.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeKey(publicKey),
        });
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user)
        throw new Error(
          "Inicia sesión otra vez para activar las notificaciones.",
        );
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userData.user.id,
          endpoint: subscription.endpoint,
          subscription: subscription.toJSON(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" },
      );
      if (error)
        throw new Error(
          "No pudimos guardar el dispositivo. Aplica la migración push en Supabase y vuelve a intentar.",
        );
      setPushEnabled(true);
      setPushStatus(
        "¡Listo! Este dispositivo quedó preparado para recibir antojitos de amor. 💗",
      );
      void registration;
    } catch (error) {
      setPushStatus(
        error instanceof Error
          ? error.message
          : "No se pudieron activar las notificaciones.",
      );
    } finally {
      setPushBusy(false);
    }
  };

  const reply = async (response: string) => {
    if (!supabase || !latest) return;
    const { error } = await supabase
      .from("love_wishes")
      .update({ response })
      .eq("id", latest.id);
    setStatus(
      error
        ? "No pudimos guardar esa respuesta todavía."
        : "Respuesta enviada con mucho amor. 💗",
    );
    if (!error) setLatest({ ...latest, response });
  };

  return (
    <div className="moon-wishes-page">
      <section className="moon-wishes-hero">
        <span className="hand-note">último capítulo</span>
        <Moon size={39} className="moon-wishes-icon" />
        <h1>
          Antojitos
          <br />
          <em>de amor</em>
        </h1>
        <p>
          Porque a veces solo necesito un poquito más de ti. Elige los que
          quieras y mándame tu mensajito.
        </p>
      </section>
      {status && <Notice>{status}</Notice>}
      <section className="moon-wish-inbox moon-push-setup">
        <div className="moon-wish-inbox-title">
          {pushEnabled ? <BellRing size={19} /> : <Bell size={19} />}
          <div>
            <span className="hand-note">que los mensajitos sí lleguen</span>
            <h2>Notificaciones en este celular</h2>
          </div>
        </div>
        <p>
          Actívalas para recibir un aviso cuando tu amor te mande un antojito,
          incluso si OnlyUs no está abierto.
        </p>
        <button
          className="moon-wish-send"
          type="button"
          onClick={() => void enablePush()}
          disabled={pushBusy || pushEnabled}
        >
          {pushBusy ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <BellRing size={18} />
          )}
          {pushEnabled ? "Notificaciones permitidas" : "Activar notificaciones"}{" "}
          <Sparkles size={16} />
        </button>
        {pushStatus && (
          <p role="status" className="moon-wish-foot">
            {pushStatus}
          </p>
        )}
      </section>
      <form onSubmit={(event) => void sendWish(event)}>
        <div className="moon-wish-grid">
          {wishes.map((wish) => (
            <button
              key={wish.id}
              type="button"
              className={
                "moon-wish-orb " +
                (selected.includes(wish.id) ? "is-selected" : "")
              }
              aria-pressed={selected.includes(wish.id)}
              onClick={() => toggle(wish.id)}
            >
              <b>{wish.icon}</b>
              <strong>{wish.title}</strong>
              <small>{wish.detail}</small>
            </button>
          ))}
        </div>
        <label className="moon-wish-message-label" htmlFor="wish-message">
          Un mensajito extra, si quieres
        </label>
        <textarea
          id="wish-message"
          className="moon-wish-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Hoy te extraño más de lo normal, mi cielo…"
          maxLength={1000}
        />
        <button className="moon-wish-send" type="submit" disabled={sending}>
          {sending ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <Send size={18} />
          )}{" "}
          Avisarle a mi amor <Sparkles size={16} />
        </button>
      </form>
      <section className="moon-wish-inbox">
        <div className="moon-wish-inbox-title">
          <Heart size={19} />
          <div>
            <span className="hand-note">
              mensajitos que viajan hasta el otro
            </span>
            <h2>Lo último que nos mandamos</h2>
          </div>
        </div>
        {loading ? (
          <p className="moon-wish-empty">Buscando mensajitos…</p>
        ) : latest ? (
          <article className="moon-wish-notification">
            <span className="hand-note">un deseo para nosotros</span>
            <h3>{latest.wish_titles.join(" · ")}</h3>
            {latest.message && <p>“{latest.message}”</p>}
            {latest.response ? (
              <p className="moon-wish-response">
                <Heart size={15} fill="currentColor" /> Respuesta:{" "}
                {latest.response}
              </p>
            ) : (
              <>
                <p>
                  Cuando tu amor lo vea, puede responder con una de estas
                  opciones:
                </p>
                <div className="moon-wish-replies">
                  {responses.map((response) => (
                    <button
                      key={response}
                      onClick={() => void reply(response)}
                      type="button"
                    >
                      {response}
                    </button>
                  ))}
                </div>
              </>
            )}
          </article>
        ) : (
          <p className="moon-wish-empty">
            Todavía no hay deseos guardados. Sé la primera personita en mandar
            uno. 💗
          </p>
        )}
      </section>
      <p className="moon-wish-foot">
        <Star size={13} /> Los deseos se guardan en nuestra base privada. Activa
        las notificaciones en cada celular y termina la configuración push de
        Supabase para recibir avisos con OnlyUs cerrado.
      </p>
    </div>
  );
}
