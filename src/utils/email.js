import nodemailer from 'nodemailer';
import AppError from './appError.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const wait = (sec) =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000 * sec);
  });

export async function sendEmail(to, msg, retries = 3) {
  try {
    const mailOptions = {
      from: '<emailexample@gmail.com>', // Nome e e-mail do remetente
      to, // Destinatário(s)
      subject: 'Uma tarefa foi realizada', // Assunto
      text: msg, // Corpo do e-mail em texto
      html: `<b>${msg}</b>`, // Corpo do e-mail em HTML
    };
    console.log('email deveria ter enviado, mas vc deveria checar no ethereal');
    const info = await transporter.sendMail(mailOptions);

    if (info.rejected.length > 0 && retries === 0) {
      throw new AppError(info.response);
    } else if (info.rejected.length > 0) {
      await wait(0.4);
      return await sendEmail(to, msg, retries - 1);
    }

    return info;
  } catch (err) {
    throw err;
  }
}
