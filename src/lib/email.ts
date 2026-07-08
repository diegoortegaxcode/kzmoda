// Node.js only — usa Resend para enviar correos transaccionales.
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "KZ Tendencias <no-reply@kztendencias.com>";

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const firstName = name.split(" ")[0] || "Hola";

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Restablece tu contraseña — KZ Tendencias",
    html: `
      <div style="margin:0;padding:24px;background:#fff1f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #fbcfe8;border-radius:20px;overflow:hidden;">
          <div style="padding:32px 32px 8px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#0f172a;">KZ Tendencias</div>
          </div>
          <div style="padding:8px 32px 32px;">
            <h1 style="font-size:20px;color:#0f172a;margin:16px 0 8px;">Restablece tu contraseña</h1>
            <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 20px;">
              Hola ${firstName}, recibimos una solicitud para restablecer la contraseña de tu cuenta.
              Haz clic en el botón para crear una nueva. Este enlace expira en 1 hora.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#ec4899;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:12px;">
              Cambiar contraseña
            </a>
            <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:24px 0 0;">
              Si no solicitaste este cambio, puedes ignorar este correo; tu contraseña seguirá siendo la misma.
            </p>
            <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:12px 0 0;word-break:break-all;">
              O copia este enlace: ${resetUrl}
            </p>
          </div>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
}
