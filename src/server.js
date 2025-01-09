import runFirst from './runFirst.js';
import app from './app.js';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('server running on port ' + port);
});

process.on('unhandledRejection', async (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
