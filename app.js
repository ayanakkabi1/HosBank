import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import sessionConfig from './config/session.config.js';
import registerRoute from './routes/registerRoute.js';
import loginRoutes from './routes/loginRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import beneficiaireRoutes from './routes/beneficiaireRoutes.js';
import carteRoutes from './routes/carteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(session(sessionConfig));


app.use('/auth', registerRoute);
app.use('/auth', loginRoutes);
app.use('/client', clientRoutes);
app.use('/client/beneficiaires', beneficiaireRoutes);
app.use('/client/carte', carteRoutes);
app.use('/admin', adminRoutes);


app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur HosBank démarré sur le port http://localhost:${port}`);
});