import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Cntx } from "../../context/context"; // 🔥 Importation de ton contexte global

const UpdateCour = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 🔥 Récupération du token, du statut de chargement et des infos de l'utilisateur connecté
  const { token, loading: contextLoading, user } = useContext(Cntx);

  // Déclaration des différents states
  const [urlVideos, setUrLVideos] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true); // Gère le chargement des données de l'API
  const [errors, setErrors] = useState({
    title: null,
    image: null,
    videos: null,
  });

  // Stockage des données du cours
  const [data, setData] = useState({
    title: "",
    description: "",
    image: null,
  });

  // Sécurité : Nettoyage propre de l'erreur générale
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Récupérer le cours sélectionné + Protection Admin intégrée
  useEffect(() => {
    const getCourse = async () => {
      // ⏳ Si le contexte est encore en train de charger la session, on attend
      if (contextLoading) return;

      // 🔒 Sécurité : Si l'utilisateur n'est pas connecté localement
      if (!token) {
        alert("Accès refusé ! Veuillez vous connecter.");
        navigate("/login");
        return;
      }

      // 🚫 Sécurité : Si l'utilisateur est connecté mais n'est pas un administrateur
      if (user && user.role !== 'admin' && !user.is_admin) {
        alert("Accès refusé ! Seul l'administrateur peut modifier ce cours.");
        navigate("/");
        return;
      }

      try {
        const response = await api.get(`/course/${id}/edit`, {
          headers: { 
            Accept: "application/json",
            Authorization: `Bearer ${token}` // 🔥 Envoi du jeton pour passer le middleware auth:sanctum
          }
        });
        setData(response.data.course);
        setFiles(Array.from(response.data.course_videos || []).map((v) => v.file));
        setLoading(false);
      } catch (error) {
        console.error(error);
        // 🚨 PROTECTION DU COMPOSANT : Expulsion si pas Admin (403) ou pas connecté (401)
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
          alert("Accès refusé ! Vos privilèges d'administrateur ont expiré.");
          navigate("/");
        } else {
          setError("Erreur lors de la récupération du cours.");
          setLoading(false);
        }
      }
    };

    getCourse();
  }, [id, navigate, token, contextLoading, user]); // 🔥 Synchronisation des dépendances

  // Synchronisation de l'affichage de l'image reçue de la DB
  useEffect(() => {
    if (data.image && !(data.image instanceof File)) {
      setImage(data.image);
    }
  }, [data.image]);

  // Gestion des URLs de prévisualisation des vidéos (avec nettoyage de la mémoire RAM)
  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map((v) => {
        if (typeof v === "string" && v.startsWith("videos/")) {
          return v;
        } else if (v instanceof File) {
          return URL.createObjectURL(v);
        }
        return null;
      }).filter(Boolean);

      setUrLVideos(urls);

      // Fonction de nettoyage pour révoquer les Blob URLs et libérer la mémoire
      return () => {
        urls.forEach(url => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
      };
    } else {
      setUrLVideos([]);
    }
  }, [files]);

  // Ajouter de nouvelles vidéos à la liste
  const getVideos = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  // Retirer une vidéo de la liste (Ancienne ou nouvelle)
  const supVideo = (i) => {
    if (window.confirm("Êtes-vous sûr de vouloir retirer cette vidéo ?")) {
      setFiles(files.filter((_, ind) => ind !== i));
    }
  };

  // Envoyer les données mises à jour
  const updateData = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", data.title || "");
      formData.append("description", data.description || "");
      formData.append("_method", "PUT"); // Requis par Laravel pour simuler du PUT via POST sur FormData

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`videos[${index}]`, file);
        });
      }

      await api.post(`/course/${id}/edit`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` // 🔥 Sécurisation de la requête de modification
        },
      });

      navigate("/cours");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          alert("Votre session a expiré ou vous n'avez plus les privilèges administrateur.");
          navigate("/");
          return;
        }
        
        if (error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setError(error.response.data.message || "Une erreur est survenue.");
        }
      } else {
        setError(error.message);
      }
    }
  };

  // ⏳ Écran d'attente initial (Vérification de session ou chargement d'API)
  if (contextLoading || loading) {
    return <div className="text-center py-20 text-muted font-bold">Chargement du formulaire et contrôle d'accès...</div>;
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 bg-white p-4 rounded-2xl shadow-sm border">
          
          {error && <p className="alert alert-danger">{error}</p>}
          
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-4">
            Modifier un Cours
          </h1>
          
          <form onSubmit={updateData} encType="multipart/form-data">
            
            {/* Titre */}
            <div className="mb-3">
              <label className="form-label font-medium">Titre</label>
              <input
                type="text"
                name="title"
                onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
                value={data.title}
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
              />
              {errors.title && <div className="invalid-feedback">{errors.title[0]}</div>}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label font-medium">Description</label>
              <textarea
                name="description"
                onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
                value={data.description}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            {/* Image de couverture */}
            <div className="mb-3">
              <label className="form-label font-medium">Image de couverture</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => setData({ ...data, [e.target.name]: e.target.files[0] })}
                className={`form-control ${errors.image ? "is-invalid" : ""}`}
              />
              {errors.image && <div className="invalid-feedback">{errors.image[0]}</div>}
              
              {/* Box de Prévisualisation d'image */}
              <div className="mt-3">
                {data.image instanceof File ? (
                  <div className="text-center border p-2 rounded-xl bg-light">
                    <p className="text-xs text-muted mb-1">Nouvelle image sélectionnée :</p>
                    <img className="img-thumbnail max-h-40" src={URL.createObjectURL(data.image)} alt="Nouveau rendu" style={{maxHeight: '150px'}} />
                  </div>
                ) : image ? (
                  <div className="text-center border p-2 rounded-xl bg-light">
                    <p className="text-xs text-muted mb-1">Image actuelle en base :</p>
                    <img className="img-thumbnail" src={`http://localhost:8000/storage/${image}`} alt="Rendu actuel" style={{maxHeight: '150px'}} />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Section Vidéos */}
            <div className="mb-4">
              <label className="form-label font-medium">Ajouter des vidéos</label>
              <input
                type="file"
                onChange={getVideos}
                name="videos"
                accept="video/*"
                multiple
                className={`form-control ${errors.videos ? "is-invalid" : ""}`}
              />
              {errors.videos && <div className="invalid-feedback">{errors.videos[0]}</div>}

              {/* Liste globale des vidéos chargées et nouvelles */}
              <div className="mt-3">
                {urlVideos && urlVideos.length > 0 && (
                  <div className="list-group gap-2">
                    <p className="text-xs font-semibold text-muted mb-0">Playlist actuelle ({urlVideos.length}) :</p>
                    {urlVideos.map((url, i) => (
                      <div key={i} className="list-group-item d-flex align-items-center justify-content-between p-2 rounded-xl bg-slate-50">
                        <video
                          className="rounded bg-black object-contain"
                          src={url.startsWith("videos/") ? `http://localhost:8000/storage/${url}` : url}
                          controls
                          width={140}
                          height={80}
                        ></video>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger px-3 rounded-lg"
                          onClick={() => supVideo(i)}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Boutons de contrôle */}
            <div className="d-flex justify-content-between gap-3">
              <Link to="/cours" className="btn btn-outline-secondary w-50 py-2 rounded-xl">
                Annuler
              </Link>
              <button type="submit" className="btn btn-success w-50 py-2 rounded-xl shadow-sm">
                Enregistrer les modifications
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCour;