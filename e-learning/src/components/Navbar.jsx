import React, { useState, useEffect, useContext } from 'react';
import { BookOpen } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cntx } from '../context/context';

const Navbar = () => {
  // 🔥 On extrait directement "logout" depuis le contexte global
  const { user , logout } = useContext(Cntx); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const [activeIndex, setActiveIndex] = useState(0);

  // 1. Définition des liens de l'ovale central selon le rôle
  const getNavLinks = () => {
    

    // Si c'est l'Admin
    if (user?.role === 'admin' || user?.is_admin) {
      return [
        { name: '🏠 Accueil', path: '/' },
        { name: '📚 Cours', path: '/cours' },
        { name: '👥 Étudiants', path: '/users' }
      ];
    }

    if(user?.role === 'super_admin'){
      return [
        {name : 'Acceuil', path: '/'},
        {name : 'Ajouter' , path : '/superadmin/prof'},
        {name : 'supprimer' , path : '/superadmin/prof'},
        {name : 'dashboard' , path : '/superadmin/prof'}
      ]
    }

    // Si c'est un Étudiant connecté
    return [
      { name: '🚀 Accueil', path: '/' },
      { name: '🎓 Mes Cours', path: '/courses' }
    ];
  };

  const links = getNavLinks();

  // 2. Aligner automatiquement le cercle magique si l'URL ou l'utilisateur change
  useEffect(() => {
    const currentIndex = links.findIndex(link => link.path === location.pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname, user, links]);

  // 3. Déconnexion asynchrone propre (Plus de rechargement de page !)
  const handleLogoutClick = async () => {
    await logout(); // Supprime le token sur Laravel + nettoie le State React
    navigate('/');  // Redirige tranquillement vers la page d'accueil
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg px-6 py-4 sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto flex items-center justify-between max-w-6xl">
        
        {/* LOGO - Brand */}
        <Link to="/" className="text-xl font-black tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BookOpen className="text-yellow-400 w-6 h-6" />
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent font-black">
            LearnHub
          </span>
        </Link>

        {/* 🔮 LE GRAND CERCLE OVALE CENTRAL */}
        <div className="relative hidden md:flex items-center bg-slate-800/90 rounded-full p-1 border border-slate-700/60 shadow-inner">
          
          {/* 🟢 Le cercle coulissant (Curseur d'arrière-plan) */}
          {links.length > 0 && (
            <div 
              className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{
                width: `${100 / links.length}%`,
                left: 0,
                transform: `translateX(${activeIndex * 100}%) scale(0.96)`,
              }}
            />
          )}

          {/* Génération dynamique des liens à l'intérieur de l'ovale */}
          {links.map((link, index) => {
            const isActive = index === activeIndex;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setActiveIndex(index)}
                className="relative z-10 px-6 py-2 rounded-full text-xs md:text-sm font-extrabold tracking-wide transition-colors duration-300 text-center"
                style={{ 
                  width: '120px', 
                  color: isActive ? '#ffffff' : '#94a3b8',
                  textDecoration : 'none'
                }} 
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* ACTIONS DROITE (Boutons d'authentification / Profil) */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline-block text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
                👤 {user.name}
              </span>
              <button 
                onClick={handleLogoutClick} // Appelle la nouvelle logique de déconnexion
                className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 text-xs font-black px-4 py-2 rounded-xl transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                style={{ textDecoration : 'none' }}

              >
                Login
              </Link>
              <Link 
                to="/register" 
                className=" bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-transform"
                style={{ textDecoration : 'none' }}
              >
                Register 🚀
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;