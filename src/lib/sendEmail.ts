// src/lib/sendEmail.ts
import sg from "@sendgrid/mail";
sg.setApiKey(process.env.SENDGRID_API_KEY!);

export function sendEmail(to: string, subject: string, html: string) {
  return sg.send({ to, from: "noreply@tennisleague.com", subject, html });
}
