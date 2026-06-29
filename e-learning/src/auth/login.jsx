import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cntx } from "../context/context";
import api from "../api/axios";

const Login = () => {
    const { setToken, user, loading, setDroitDaccee, error, setAccee } = useContext(Cntx);
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();
    
    // Récupérer le message de redirection du localStorage
    useEffect(() => {
        const msg = localStorage.getItem('message');
        if (msg) {
            setMessage(msg);
            localStorage.removeItem('message');
            setAccee(false)
        }
    }, []);

    // Gérer la redirection automatique une fois le user chargé dans le contexte
    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin' || user.is_admin) {
                navigate('/users');
            } else if(user.role === 'super_admin'){
                navigate('/superadmin/prof');
            } else{
                navigate('/courses')
            }
        }
    }, [loading, user, navigate]);

    // Soumission du formulaire
    const sentData = async (e) => {
        e.preventDefault();
        setErrors(null);
        setIsSubmitting(true);

        try {
            const response = await api.post('/login', {
                email: email,
                password: password
            });
            
            // Si Laravel renvoie directement la chaîne du token ou un objet { token: ... }
            const tokenRecu = response.data.token || response.data;
            
            localStorage.setItem('token', tokenRecu);
            if (setToken) setToken(tokenRecu);
            
            // Note : L'application va détecter le nouveau token, recharger le profil utilisateur global, 
            // et le deuxième useEffect s'occupera de rediriger proprement selon le rôle.
            
        } catch (error) {
            setErrors(error.response?.data?.message || "Identifiants incorrects ou problème de connexion.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
                
                {/* Petits éléments graphiques pour le fun */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>

                {/* En-tête */}
                <div className="text-center mb-8">
                    <span className="text-4xl">🤖</span>
                    <h2 className="text-3xl font-black text-slate-900 mt-2">Bon retour !</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Prêt pour la suite de l'aventure ?</p>
                </div>

                {/* Messages Flash d'alertes */}
                {message && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-xl text-center text-xs font-bold mb-4 animate-pulse">
                        🔒 {message}
                    </div>
                )}
                
                {errors && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-center text-xs font-bold mb-4">
                        ⚠️ {errors}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-center text-xs font-bold mb-4">
                        ⚠️ {error}
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={sentData} className="space-y-5">
                    
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                            Adresse Email
                        </label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 text-sm"
                            placeholder="exemple@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                            Mot de passe
                        </label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-xs font-bold text-slate-600 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                name="remember" 
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 me-2"
                            />
                            Se souvenir de moi
                        </label>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center text-sm border-b-4 border-purple-800"
                    >
                        {isSubmitting ? "Connexion en cours... 🚀" : "C'est parti ! 🎯"}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-xs font-bold text-slate-500">
                            Tu n'as pas encore de compte ?{" "}
                            <Link to="/register" className="text-indigo-600 hover:underline font-black">
                                Crée un compte ici
                            </Link>
                        </p>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default Login;