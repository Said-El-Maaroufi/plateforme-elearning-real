import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Cntx } from "../../context/context"; // 🔥 Importation de ton contexte global

const CourseInfo = () => {
    // 🔥 Récupération du token, du statut de chargement global et des infos de l'utilisateur connecté
    const { token, loading: contextLoading, user } = useContext(Cntx);
    
    const [course, setcourse] = useState(null);
    const [nbr_videos, setNbrVideos] = useState(0);
    const [nbr_participants, setNbrParticipants] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();

    // 🕒 Fonction de conversion : Secondes -> Heures et Minutes
    const formatDuration = (totalSeconds) => {
        if (!totalSeconds || totalSeconds <= 0) return "0h 0m";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    useEffect(() => {
        const getCourseDetails = async () => {
            // ⏳ Si l'application charge encore les infos de session de l'utilisateur, on patiente
            if (contextLoading) return;

            // 🔒 Sécurité : Si aucun jeton n'est trouvé localement
            if (!token) {
                alert("Accès refusé ! Veuillez vous connecter.");
                navigate("/login");
                return;
            }

            // 🚫 Sécurité : Si l'utilisateur est connecté mais n'est pas un administrateur
            if (user && user.role !== 'admin' && !user.is_admin) {
                alert("Accès refusé ! Cet espace est réservé aux administrateurs.");
                navigate("/");
                return;
            }

            try {
                const response = await api.get(`/course/${id}`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`, // 🔥 Envoi du jeton à Laravel Sanctum
                    },
                });
                setcourse(response.data.course);
                setNbrVideos(response.data.nbr_videos);
                setNbrParticipants(response.data.nbr_participants);
            } catch (error) {
                console.error("Erreur lors du chargement des détails :", error.response);
                
                // 🚨 PROTECTION CÔTÉ CLIENT : Expulsion si le token a expiré ou si les droits ont sauté
                if (error.response && (error.response.status === 403 || error.response.status === 401)) {
                    alert("Accès refusé ! Vos privilèges d'administrateur ont expiré.");
                    navigate("/");
                }
            }
        };

        getCourseDetails();
    }, [id, navigate, token, contextLoading, user]); // 🔥 Synchronisation complète des dépendances

    // ⏳ Écran de chargement initial (Pendant la validation des droits ou la récupération d'API)
    if (contextLoading || !course) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center text-slate-500 font-medium">
                    Vérification des accès et chargement du cours...
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5 flex justify-center">
            <div className="max-w-sm w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col justify-between">
                
                {/* Image du cours */}
                <div className="relative h-48 w-full bg-slate-100">
                    <img  
                        src={`http://localhost:8000/storage/${course.image}`} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                        Enseignant
                    </span>
                </div>

                {/* Contenu principal */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1 mb-2">
                        {course.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                        {course.description || "Aucune description fournie."}
                    </p>

                    {/* Grille des statistiques */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 text-slate-600 mb-4">
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
                            <span className="text-xs font-medium text-slate-400">Vidéos</span>
                            <span className="text-sm font-bold text-slate-700">{nbr_videos}</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
                            <span className="text-xs font-medium text-slate-400">Durée</span>
                            {/* 🔥 Modification ici : Application de la fonction de formatage */}
                            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                {formatDuration(course.videos_sum_duree_en_seconde)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
                            <span className="text-xs font-medium text-slate-400">Élèves</span>
                            <span className="text-sm font-bold text-slate-700">{nbr_participants}</span>
                        </div>
                    </div>
                  
                    {/* Bouton Retour stylisé */}
                    <div className="mt-auto pt-2">
                        <Link 
                            to="/cours" 
                            className="btn btn-outline-secondary w-full text-sm font-medium py-2 rounded-xl transition-all block text-center"
                        >
                            ← Retour à la liste
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CourseInfo;