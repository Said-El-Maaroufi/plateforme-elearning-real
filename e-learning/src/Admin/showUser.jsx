import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Cntx } from "../context/context"; // 🔥 Ton contexte global pour le token

const ShowUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 🔥 Récupération du token, de l'état de chargement global et de l'utilisateur connecté
  const { token, loading: contextLoading, user: currentUser } = useContext(Cntx);

  const [profile, setProfile] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserDetails = async () => {
      // ⏳ ÉTAPE 1 : Si le contexte est encore en train de charger l'utilisateur, ON PATIENTE
      if (contextLoading) return;

      // 🔒 ÉTAPE 2 : Si le chargement est fini mais qu'il n'y a pas de jeton -> Redirection Login
      if (!token) {
        alert("Accès refusé ! Veuillez vous connecter.");
        navigate("/login");
        return;
      }

      // 🚫 ÉTAPE 3 : Si la session est chargée et qu'on a un token, on vérifie STRICTEMENT le rôle Admin
      if (currentUser) {
        const isAdmin = currentUser.role === 'admin' || currentUser.is_admin;
        
        if (!isAdmin) {
          alert("Accès refusé ! Cet espace est réservé aux administrateurs.");
          navigate("/");
          return;
        }
      } else {
        // Si contextLoading est false, qu'il y a un token mais pas encore de currentUser, 
        // on attend que l'état global du contexte se stabilise pour éviter d'expulser l'admin par erreur.
        return; 
      }

      // 🚀 ÉTAPE 4 : L'utilisateur est validé comme Administrateur, on peut lancer la requête API
      try {
        const response = await api.get(`/user/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // 🔥 Envoi du jeton à Laravel Sanctum
          },
        });
        
        setProfile(response.data.user);
        setUserCourses(response.data.courses || []);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement de l'utilisateur :", err.response);
        
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          alert("Votre session a expiré ou vos privilèges ont changé.");
          navigate("/");
        } else {
          setError("Impossible de récupérer les informations de cet utilisateur.");
          setLoading(false);
        }
      }
    };

    getUserDetails();
  }, [id, navigate, token, contextLoading, currentUser]);

  // ⏳ Écran d'attente pendant la vérification des accès et la récupération de l'API
  if (contextLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500 font-bold">
          Vérification des accès et chargement du profil...
        </div>
      </div>
    );
  }

  // ⚠️ Affichage en cas d'erreur de récupération de données
  if (error) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger shadow-sm">{error}</div>
        <Link to="/users" className="btn btn-secondary rounded-xl">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          {/* Bouton Retour */}
          <div className="mb-4">
            <Link to="/users" className="btn btn-outline-secondary rounded-xl text-sm px-3">
              ← Retour à la liste des utilisateurs
            </Link>
          </div>

          {/* 1. Carte des Informations Administratives de l'Utilisateur */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <div className="d-flex align-items-center gap-3 border-b pb-3 mb-3">
              {/* Avatar dynamique basé sur la première lettre */}
              <div className="bg-indigo-600 text-white rounded-circle d-flex align-items-center justify-content-center font-bold text-xl" style={{ width: "60px", height: "60px" }}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-0">{profile.name}</h2>
                <span >
                  ID de l'élève : #{profile.id}
                </span>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-sm-6">
                <p className="mb-1 text-xs text-slate-400 uppercase font-semibold tracking-wider">Adresse Email</p>
                <p className="text-slate-800 font-medium">{profile.email}</p>
              </div>
              <div className="col-sm-6">
                <p className="mb-1 text-xs text-slate-400 uppercase font-semibold tracking-wider">Rôle système</p>
                <p className="text-slate-800 font-medium">
                  <span className={`badge ${profile.role === 'admin' || profile.is_admin ? 'bg-danger' : 'bg-info'}`}>
                    {profile.role || 'Étudiant'}
                  </span>
                </p>
              </div>
              <div className="col-sm-6">
                <p className="mb-1 text-xs text-slate-400 uppercase font-semibold tracking-wider">Date d'inscription sur la plateforme</p>
                <p className="text-slate-800 font-medium">
                  {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Section des cours rejoints par l'étudiant */}
          <h3 className="text-lg font-bold text-slate-700 mb-3 mt-4">
            Cours suivis par cet utilisateur ({userCourses.length})
          </h3>

          {userCourses.length === 0 ? (
            <div className="bg-white p-5 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 italic">
              Cet utilisateur ne participe à aucun cours pour le moment.
            </div>
          ) : (
            <div className="row g-3">
              {userCourses.map((course) => (
                <div key={course.id} className="col-md-6">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 h-100 d-flex flex-column justify-content-between">
                    
                    {/* Image de couverture du cours */}
                    <div className="h-32 bg-slate-50 w-full relative">
                      <img 
                        src={`http://localhost:8000/storage/${course.image}`} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=Pas+d%27image' }}
                      />
                    </div>

                    {/* Contenu et liens */}
                    <div className="p-3 flex-1 d-flex flex-column justify-content-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base line-clamp-1 mb-1">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                          {course.description || "Aucune description disponible pour cette formation."}
                        </p>
                      </div>

                      {/* Lien vers la fiche de statistiques globales du cours */}
                     
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ShowUser;