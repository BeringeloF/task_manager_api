import amqp from 'amqplib';
import { sendEmail } from '../utils/email.js';

export const processEmailQueue = async (name) => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    let idleTimer;

    const queue = 'queue';
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    const closeWorkerIfIdleFor = (idleTimeout) => {
      if (idleTimer) clearTimeout(idleTimer);

      idleTimer = setTimeout(() => {
        console.log('Worker is idle for 30 secs. Closing Worker...');
        channel.close();
        connection.close();
      }, idleTimeout * 1000);
    };

    closeWorkerIfIdleFor(30);

    channel.prefetch(1);
    channel.consume(
      queue,
      async (data) => {
        console.log(name);
        if (idleTimer) clearTimeout(idleTimer);
        let [to, msg, taskId] = JSON.parse(data.content.toString());
        try {
          await sendEmail(to, msg);
          channel.ack(data);
        } catch (secError) {
          console.error(
            `failed to deliver notification of completed task ${taskId} to ${to}`,
            secError
          );
          channel.nack(data, false, false);
        } finally {
          closeWorkerIfIdleFor(30);
        }
      },
      { noAck: false }
    );

    console.log(' [*] Waiting for messages. To exit press CTRL+C');
  } catch (firstError) {
    console.warn(firstError);
  }
};
