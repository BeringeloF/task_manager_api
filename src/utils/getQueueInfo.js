import axios from 'axios';

const RABBITMQ_HOST = 'http://localhost:15672';
const RABBITMQ_USER = 'guest';
const RABBITMQ_PASS = 'guest';

export const getQueues = async () => {
  try {
    const response = await axios.get(`${RABBITMQ_HOST}/api/queues`, {
      auth: {
        username: RABBITMQ_USER,
        password: RABBITMQ_PASS,
      },
    });

    console.log('Filas no RabbitMQ:');
    response.data.forEach((queue) => {
      console.log(`- ${queue.name}: ${queue.messages_ready} mensagens`);
    });

    return response.data[0];
  } catch (error) {
    console.error('Erro ao acessar RabbitMQ API:', error.message);
  }
};
