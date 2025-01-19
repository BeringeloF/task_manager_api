import runFirst from './runFirst.js';
import express from 'express';
import morgan from 'morgan';
import taskRoutes from './api/routes/taskRoutes.js';
import authRoutes from './api/routes/authRoutes.js';
import errorHandler from './api/errorHandler.js';
import { sanitizeXss } from './api/middleware/sanitizeXss.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swaggerConfig.js';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use(sanitizeXss);

app.use(helmet());

//CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

const limiter = rateLimit({
  max: 300,

  windowMs: 1000 * 60 * 15,

  message: 'Too many requests from this IP, please try again in 15 minutes!',
});
app.use('/api', limiter);

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

taskRoutes(app, '/api/v1/tasks');
authRoutes(app, '/api/v1/auth');

app.use(errorHandler);

export default app;
