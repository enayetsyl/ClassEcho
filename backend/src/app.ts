import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
// import router from './app/routes';
import notFound from './app/middlewares/not-found';
// import globalErrorHandler from './app/middlewares/globalErrorhandler';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));

// application routes
// app.use('/api/v1', router); // /api/v1 will prefix all the route. This is the connection with the index.ts file inside the routes folder. 

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from ClassEcho server');
});

// app.use(globalErrorHandler);  // This is connected with the globalErrorhandler.ts file at the middleware folder.

//Not Found
app.use(notFound);

export default app;