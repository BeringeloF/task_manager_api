import amqp from 'amqplib';

export const publishEmailTask = async (to, msg) => {
  const queue = 'queue';
  let connection;
  try {
    connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    console.log(to, msg);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify([to, msg])), {
      persistent: true,
    });
    await channel.close();
  } catch (err) {
    console.warn(err);
  } finally {
    await connection.close();
  }
};
