import express from "express";
import session from "express-session";
import sessionConfig from './config/session.config.js';
import loginRoutes from './routes/loginRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session(sessionConfig));
const port = process.env.PORT|| 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', loginRoutes);
app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});