import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const msg = localStorage.getItem('message');
    if (msg) {
      setMessage(msg);
      localStorage.removeItem('message');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 overflow-x-hidden">
      
      {/* Zone des messages d'alertes flash */}
      {message 
      ? message.includes('bien') ?  
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-green-100 border-2 border-green-300 text-green-700 px-4 py-3 rounded-2xl text-center font-medium shadow-sm animate-bounce">
            🚀 {message}
          </div>
        </div>
        :<div className="container mx-auto px-4 pt-4">
          <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-2xl text-center font-medium shadow-sm animate-bounce">
            🚀 {message}
          </div>
        </div>
      :'' }

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
            
            {/* Colonne Texte & Actions */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              
              <span className="inline-block bg-yellow-400/20 text-yellow-700 font-bold text-xs md:text-sm px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-yellow-400/30">
                🤖 L'aventure du futur commence ici !
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                Libère le super potentiel de <span className="text-indigo-600 underline decoration-wavy decoration-yellow-400">ton enfant</span> !
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Découvre une méthode amusante et interactive pour maîtriser <span className="text-purple-600 font-bold">l'Intelligence Artificielle</span>, la <span className="text-emerald-600 font-bold">Robotique</span> et l'agilité mentale ! 🚀
              </p>
              
              {/* Boutons d'actions */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
                <Link 
                  to="/courses" 
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-[0_4px_14px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-200 text-center border-b-4 border-teal-700"
                >
                  🎯 Voir les Cours !
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white hover:bg-slate-50 text-indigo-600 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-md border-2 border-indigo-100 hover:scale-105 transition-all duration-200 text-center"
                >
                  🔑 Se connecter
                </Link>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 bg-white text-slate-800 font-bold px-4 py-2.5 rounded-xl shadow-sm border-2 border-slate-100 text-sm">
                  📚 <span className="text-indigo-600">+100</span> Leçons fun
                </div>
                <div className="flex items-center gap-2 bg-white text-slate-800 font-bold px-4 py-2.5 rounded-xl shadow-sm border-2 border-slate-100 text-sm">
                  🎓 Profs Experts
                </div>
                <div className="flex items-center gap-2 bg-white text-slate-800 font-bold px-4 py-2.5 rounded-xl shadow-sm border-2 border-slate-100 text-sm">
                  🎮 Jeux Interactifs
                </div>
              </div>

            </div>

            {/* 🔥 Nouvelle Colonne Image : Plus colorée, futuriste et attirante pour les jeunes */}
            <div className="w-full lg:w-1/2 flex justify-center relative">
              {/* Halo lumineux coloré en arrière-plan pour l'effet magique */}
              <div className="absolute top-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
              <div className="absolute bottom-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
              
              <div className="relative bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-[2rem] shadow-2xl max-w-sm md:max-w-md transform hover:scale-[1.02] transition-transform duration-300 border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800&h=700" 
                  alt="Robot intelligent et futuriste amusant" 
                  className="rounded-[1.7rem] w-full h-auto object-cover"
                />
                
                {/* Badge flottant interactif */}
                <div className="absolute -bottom-5 right-5 bg-yellow-400 text-slate-900 font-black px-5 py-3 rounded-2xl shadow-xl border-2 border-white text-sm animate-pulse flex items-center gap-2">
                  <span>🚀</span> Code ton futur !
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION DES THÉMATIQUES --- */}
      <section className="py-12 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-8">Qu'est-ce qu'on va apprendre aujourd'hui ? 👇</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-purple-100 hover:border-purple-300 transition-all duration-200">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-xl font-bold text-purple-700 mb-2">Intelligence Artificielle</h3>
              <p className="text-slate-500 text-sm font-medium">Apprends à donner des super-pouvoirs de réflexion aux ordinateurs !</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-200">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-bold text-indigo-700 mb-2">Robotique</h3>
              <p className="text-slate-500 text-sm font-medium">Construis et programme tes propres compagnons métalliques.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-200">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-emerald-700 mb-2">Super Mémoire</h3>
              <p className="text-slate-500 text-sm font-medium">Des techniques secrètes pour retenir tout ce que tu veux en t'amusant !</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;