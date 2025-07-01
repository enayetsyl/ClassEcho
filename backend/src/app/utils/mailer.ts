import nodemailer from 'nodemailer';
import config from '../../config';

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: Number(config.smtp_port),
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
  secure: config.smtp_secure === 'true',
});

export default transporter;
