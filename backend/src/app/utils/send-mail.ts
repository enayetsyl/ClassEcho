import config from "../../config";
import { SendMailOptions } from "../type/utils";
import transporter from "./mailer";




/**
 * Sends an email using the preconfigured Nodemailer transporter.
 * @param options - { to, subject, text, html, from }
 */
export const sendMail = async (options: SendMailOptions) => {
  await transporter.sendMail({
    from: config.mail_from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};
