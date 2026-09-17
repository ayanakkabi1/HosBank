import * as loginService from '../services/loginService.js';

export const renderLogin = (req, res) => {
  res.render("auth/login", { error: null });
};

export const processLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await loginService.authenticate(email, password);
    req.session.user = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
    };

    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    if (user.role === "charge_clientele") {
      return res.redirect("/employee/dashboard"); 
    }

    res.redirect("/client/dashboard");
  } catch (error) {
    res.status(400).render("auth/login", { error: error.message });
  }
};
