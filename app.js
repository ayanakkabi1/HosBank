import express from "express";
import session from "express-session";
import sessionConfig from './config/session.config.js';
const app = express();
app.use(session(sessionConfig));
const port = process.env.PORT|| 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})