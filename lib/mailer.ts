import "server-only";

/** Manda o link de troca de senha pelo Resend. Sem RESEND_API_KEY (dev), só mostra o link no terminal. */
export async function sendResetEmail(to: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[dev] link de troca de senha pra ${to}: ${link}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "pqp, era pra hoje? <onboarding@resend.dev>",
      to,
      subject: "troca de senha",
      text: `esqueceu, né? acontece.\n\ntroca a senha por aqui (vale 1 hora):\n${link}\n\nse não foi você, ignora.`,
    }),
  });
  if (!res.ok) throw new Error(`resend respondeu ${res.status}`);
}
