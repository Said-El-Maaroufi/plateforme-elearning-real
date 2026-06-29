import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { Cntx } from "../context/context";
import api from "../api/axios";

const Register = () => {
  const { setToken } = useContext(Cntx);
  const navigate = useNavigate();

  const [name, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_conf, setPassword_conf] = useState("");

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sentData = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Petite validation de sécurité côté client avant d'envoyer à Laravel
    if (password !== password_conf) {
      setError("Les mots de passe ne correspondent pas ! 🚫");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.post("/register", {
        name: name,
        email: email,
        password: password,
        password_confirmation: password_conf,
      });

      // S'adapte au format de réponse de ton contrôleur Laravel
      const tokenRecu = res.data.token || res.data;

      localStorage.setItem("token", tokenRecu);
      localStorage.setItem("message", res.data.msg);
      if (setToken) setToken(tokenRecu);

      // Redirection vers l'espace de cours une fois inscrit
      navigate("/courses");
    } catch (error) {
      if (error.response?.data?.message || error.message) {
        setError("Une erreur est survenue lors de l'inscription.");
      }
      setErrors(error.response.data.errors);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
        {/* Éléments de fond décoratifs */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>

        {/* En-tête */}
        <div className="text-center mb-6">
          <span className="text-4xl">🚀</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            Créer un compte
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Rejoins l'aventure de l'apprentissage !
          </p>
        </div>

        {/* Gestion de l'affichage de l'erreur */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-center text-xs font-bold mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire d'inscription */}
        <form onSubmit={sentData} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Nom Complet
            </label>
            <input
              type="text"
              name="name"
              required
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 text-sm"
              placeholder="Ex: Saïd El Maaroufi"
            />
            {errors.name && <p className="text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 text-sm"
              placeholder="exemple@email.com"
            />
            {errors.email && <p className="text-red-600">{errors.email}</p>}

          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 text-sm"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="password_confirmation"
              required
              onChange={(e) => setPassword_conf(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center text-sm border-b-4 border-teal-700 mt-2"
          >
            {isSubmitting ? "Création en cours... 🛸" : "Créer mon compte ! 🎯"}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs font-bold text-slate-500">
              Tu as déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:underline font-black"
              >
                Connecte-toi ici
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
