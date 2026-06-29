import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import api from '../api/axios';
import { Cntx } from '../context/context'; // 🔥 Importation de ton contexte global

const CourseWorkspace = () => {
    const { courseId } = useParams(); 
    const navigate = useNavigate();   
    
    // 🔥 Récupération du token et du statut de chargement de la session globale
    const { token, loading: contextLoading } = useContext(Cntx);
    
    const [course, setCourse] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [maxAccessibleIndex, setMaxAccessibleIndex] = useState(0);
    const [videoCompleted, setVideoCompleted] = useState(false);

    useEffect(() => {
        // ⏳ Étape 1 : On attend que l'état global d'authentification soit chargé
        if (contextLoading) return;

        // 🔒 Étape 2 : Sécurité côté Client - Si le jeton local est manquant
        if (!token) {
            localStorage.setItem('message', 'Veuillez vous connecter pour accéder à votre espace.');
            navigate('/login');
            return;
        }

        // 🚀 Étape 3 : Requête API avec le jeton d'authentification
        api.get(`/cour/${courseId}`, {
            headers : {
                Accept : "application/json",
                Authorization: `Bearer ${token}` // Envoi du Token pour Laravel Sanctum
            }
        })
            .then(response => {
                setCourse(response.data);
                setVideos(response.data.videos || []); 
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur d'accès au cours :", err);

                if (err.response) {
                    // 🚫 Cas 1 : L'utilisateur est connecté mais Laravel a renvoyé 403 (Pas inscrit à la table pivot)
                    if (err.response.status === 403) {
                        alert(err.response.data.message || "🔒 Accès refusé ! Vous n'êtes pas inscrit à cette formation.");
                        navigate('/courses'); // Redirection vers le catalogue
                        return;
                    }

                    // 🚨 Cas 2 : Session expirée ou jeton invalide (Erreur 401)
                    if (err.response.status === 401) {
                        localStorage.setItem('message', 'Votre session a expiré. Veuillez vous reconnecter.');
                        navigate('/login'); 
                        return;
                    }
                }

                setError("Impossible de charger le contenu de ce cours.");
                setLoading(false);
            });
    }, [courseId, navigate, token, contextLoading]);

    // ⏳ Écran d'attente initial (pendant la validation du token et la récupération API)
    if (contextLoading || loading) {
        return (
            <div className="text-center py-20 text-white bg-gray-900 min-h-screen flex items-center justify-center font-medium">
                Vérification de vos accès et chargement de votre espace...
            </div>
        );
    }

    // ⚠️ Affichage en cas d'erreur générale
    if (error) {
        return (
            <div className="text-center py-20 text-white bg-gray-900 min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-400 font-medium">{error}</p>
                <button onClick={() => navigate('/courses')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm border border-gray-700 hover:bg-gray-700">
                    Retour aux cours
                </button>
            </div>
        );
    }

    if (!course || videos.length === 0) {
        return (
            <div className="text-center py-20 text-white bg-gray-900 min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 font-medium">Aucune vidéo disponible pour ce cours.</p>
                <button onClick={() => navigate('/courses')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm border border-gray-700 hover:bg-gray-700">
                    Retour aux cours
                </button>
            </div>
        );
    }

    const currentVideo = videos[currentVideoIndex];

    // Fonction pour gérer la sélection d'une vidéo
    const selectVideo = (index) => {
        if (index > maxAccessibleIndex) {
            alert("🔒 Vous devez terminer la vidéo actuelle avant de pouvoir passer à la suivante !");
            return;
        }
        setCurrentVideoIndex(index);
        setVideoCompleted(index < maxAccessibleIndex);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate('/courses')} 
                        className="text-gray-400 hover:text-white text-sm bg-gray-700 px-3 py-1.5 rounded-lg transition-colors duration-200"
                    >
                        ← Retour aux cours
                    </button>
                    <h1 className="text-xl font-bold line-clamp-1">{course.title}</h1>
                </div>
                <div className="text-sm text-gray-400 hidden sm:block">
                    Progression : <span className="text-emerald-400 font-bold">{Math.round(((maxAccessibleIndex + (videoCompleted && currentVideoIndex === videos.length - 1 ? 1 : 0)) / videos.length) * 100)}%</span>
                </div>
            </header>

            {/* Zone principale */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                
                {/* Zone lecteur vidéo principale */}
                <div className="flex-grow p-4 bg-black flex flex-col justify-center items-center overflow-y-auto">
                    <div className="w-full max-w-4xl aspect-video bg-gray-950 rounded-xl overflow-hidden relative shadow-2xl">
                        <video
                            key={currentVideo.id}
                            controls
                            controlsList="nodownload"
                            onEnded={() => {
                                setVideoCompleted(true);
                                if (currentVideoIndex + 1 > maxAccessibleIndex && currentVideoIndex + 1 < videos.length) {
                                    setMaxAccessibleIndex(currentVideoIndex + 1);
                                }
                            }}
                            className="w-full h-full object-contain"
                            autoPlay
                        >
                            <source src={`http://localhost:8000/storage/${currentVideo.file}`} type="video/mp4" />
                            Votre navigateur ne supporte pas les vidéos HTML5.
                        </video>
                    </div>

                    {/* Titre et détails de la vidéo sous le lecteur */}
                    <div className="w-full max-w-4xl mt-4 px-2">
                        <h2 className="text-xl font-semibold text-gray-100">{currentVideo.title}</h2>
                        <div className="mt-2 flex items-center space-x-2">
                            {videoCompleted ? (
                                <span className="inline-flex items-center text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                                    ✓ Vidéo terminée
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-medium animate-pulse">
                                    ▶ En cours de visionnage
                                </span>
                            )}
                        </div>
                        {currentVideo.description && (
                            <p className="text-gray-400 text-sm mt-3 border-t border-gray-800 pt-3">
                                {currentVideo.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Barre latérale droite (Liste des chapitres) */}
                <div className="w-full md:w-80 bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700 overflow-y-auto flex flex-col">
                    <div className="p-4 border-b border-gray-700 font-semibold text-gray-300 shadow-sm bg-gray-800/50 sticky top-0 backdrop-blur-sm z-10">
                        Contenu de la formation ({videos.length} chapitres)
                    </div>
                    
                    <div className="divide-y divide-gray-700/40 flex-grow">
                        {videos.map((video, index) => {
                            const isLocked = index > maxAccessibleIndex;
                            const isActive = index === currentVideoIndex;
                            const isDone = index < maxAccessibleIndex || (index === currentVideoIndex && videoCompleted);

                            return (
                                <button
                                    key={video.id}
                                    onClick={() => selectVideo(index)}
                                    disabled={isLocked}
                                    className={`w-full text-left p-4 flex items-start space-x-3 text-sm transition-all duration-200
                                        ${isActive ? 'bg-blue-600/15 text-blue-400 border-l-4 border-blue-500' : 'hover:bg-gray-700/40'}
                                        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {/* Statut visuel */}
                                    <span className="mt-0.5 flex-shrink-0 text-base">
                                        {isLocked ? "🔒" : isDone ? "🟢" : "🔵"}
                                    </span>

                                    {/* Infos textuelles */}
                                    <div className="flex-grow">
                                        <p className={`font-medium transition-colors ${isActive ? 'text-blue-300' : 'text-gray-200'}`}>
                                            {index + 1}. {video.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                                            <span>{isLocked ? "Bloqué" : isDone ? "Terminé" : "À regarder"}</span>
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CourseWorkspace;