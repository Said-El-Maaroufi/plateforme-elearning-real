import { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Cntx } from "../../context/context"; // 🔥 Importation de ton contexte global

const AddCours = () => {
  // 🔥 Récupération du token, du statut de chargement global et des infos de l'utilisateur
  const { token, loading: contextLoading, user } = useContext(Cntx);

  const [urlVideos, setUrLVideos] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    titre: "",
    description: "",
    image: null,
  });

  // 🔒 PROTECTION PRÉVENTIVE : Empêche l'accès au formulaire si l'utilisateur n'est pas Admin
  useEffect(() => {
    if (contextLoading) return;

    if (!token) {
      alert("Accès refusé ! Veuillez vous connecter.");
      navigate("/login");
      return;
    }

    if (user && user.role !== "admin" && !user.is_admin) {
      alert("Accès refusé ! Espace réservé aux administrateurs.");
      navigate("/");
    }
  }, [token, contextLoading, user, navigate]);

  // Nettoyage propre des erreurs générales
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Afficher les vidéos sélectionnées
  const showVideo = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Révoquer les anciennes URLs pour libérer la mémoire du navigateur
    urlVideos.forEach((url) => URL.revokeObjectURL(url));

    setUrLVideos(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  // Supprimer une vidéo de la sélection
  const sup = (index) => {
    URL.revokeObjectURL(urlVideos[index]);

    setFiles(files.filter((_, i) => i !== index));
    setUrLVideos(urlVideos.filter((_, i) => i !== index));
  };

  // Envoyer les données
  const sentData = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Bloquer le bouton

    try {
      const formData = new FormData();
      formData.append("title", data.titre);
      formData.append("description", data.description);

      if (data.image) {
        formData.append("image", data.image);
      }

      files.forEach((file) => {
        formData.append("videos[]", file);
      });

      await api.post("/ajouter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/cours");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          alert(
            "Votre session a expiré ou vous n'avez plus les droits d'administrateur.",
          );
          navigate("/");
          return;
        }
        setErrors(error.response.data.errors || null);
        setError(error.response.data.message || "Une erreur est survenue.");
      } else {
        setError(error.message);
      }
    } finally {
      setIsSubmitting(false); // Réactiver le bouton
    }
  };

  // ⏳ Écran d'attente initial (Contrôle d'accès)
  if (contextLoading) {
    return (
      <div className="text-center py-20 text-muted font-bold">
        Vérification des droits d'accès administrateur...
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          {error && <div className="alert alert-danger shadow-sm">{error}</div>}

          <h1 className="text-2xl font-bold text-center text-slate-800 mb-4">
            Ajouter un Cours
          </h1>

          <form onSubmit={sentData} encType="multipart/form-data">
            {/* Titre */}
            <div className="mb-3">
              <label className="form-label font-medium text-slate-700">
                Titre
              </label>
              <input
                type="text"
                name="titre"
                onChange={(e) =>
                  setData({ ...data, [e.target.name]: e.target.value })
                }
                value={data.titre}
                className={`form-control ${errors?.title ? "is-invalid" : ""}`}
              />
              {errors?.title && (
                <div className="invalid-feedback">{errors.title[0]}</div>
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                onChange={(e) =>
                  setData({ ...data, [e.target.name]: e.target.value })
                }
                value={data.description}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            {/* Image */}
            <div className="mb-3">
              <label className="form-label font-medium text-slate-700">
                Image de couverture
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) =>
                  setData({ ...data, [e.target.name]: e.target.files[0] })
                }
                className="form-control"
              />
            </div>

            {/* Vidéos */}
            <div className="mb-4">
              <label className="form-label font-medium text-slate-700">
                Vidéos du cours
              </label>
              <input
                type="file"
                onChange={showVideo}
                name="videos"
                accept="video/*"
                multiple
                className={`form-control ${errors?.videos ? "is-invalid" : ""}`}
              />
              {errors?.videos && (
                <div className="invalid-feedback">{errors.videos[0]}</div>
              )}

              {/* Prévisualisation des vidéos */}
              <div className="mt-3">
                {urlVideos.length > 0 && (
                  <ul className="list-group gap-2">
                    {urlVideos.map((urlVideo, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex align-items-center justify-content-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <video
                          src={urlVideo}
                          className="rounded bg-black object-contain"
                          controls
                          width={140}
                          height={80}
                        ></video>
                        <button
                          type="button"
                          onClick={() => sup(index)}
                          className="btn btn-sm btn-danger px-3 py-1 rounded-lg"
                        >
                          Retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="d-grid gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-success py-2.5 font-medium rounded-xl shadow-sm"
              >
                {isSubmitting
                  ? "Envoi et traitement de la vidéo en cours..."
                  : "Enregistrer la formation"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/cours")}
                className="btn btn-outline-secondary py-2 font-medium rounded-xl"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCours;
