import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import router from './app/routes';
import notFound from './app/middlewares/not-found';
import globalErrorHandler from './app/middlewares/global-error-handler';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));

// application routes
app.use('/api/v1', router); 

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from ClassEcho server');
});

app.use(globalErrorHandler);  

//Not Found
app.use(notFound);

export default app;