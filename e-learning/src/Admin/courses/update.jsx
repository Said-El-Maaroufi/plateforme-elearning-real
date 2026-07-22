import { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { Cntx } from "../../context/context";

const UpdateCours = () => {
  const { id } = useParams();
  const { token, loading: contextLoading, user } = useContext(Cntx);

  const [urlVideos, setUrLVideos] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingCourse, setFetchingCourse] = useState(true);
  const navigate = useNavigate();

  const [data, setData] = useState({
    titre: "",
    description: "",
    image: null,
  });

  // Protection d'accès
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

  // Chargement des données existantes du cours
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/course/${id}/edit`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const course = response.data;
        setData({
          titre: course.title || "",
          description: course.description || "",
          image: null,
        });
        setExistingVideos(course.videos || []);
      } catch (err) {
        setError("Erreur lors de la récupération du cours.");
      } finally {
        setFetchingCourse(false);
      }
    };

    if (token) fetchCourse();
  }, [id, token]);

  // Nettoyage temporisé des erreurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const showVideo = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    urlVideos.forEach((url) => URL.revokeObjectURL(url));
    setUrLVideos(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const supNewVideo = (index) => {
    URL.revokeObjectURL(urlVideos[index]);
    setFiles(files.filter((_, i) => i !== index));
    setUrLVideos(urlVideos.filter((_, i) => i !== index));
  };

  const sentData = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Bloquer le bouton

    try {
      const formData = new FormData();
      // On passe _method pour simuler PUT avec multipart/form-data
      formData.append("_method", "PUT"); 
      formData.append("title", data.titre);
      formData.append("description", data.description);

      if (data.image) {
        formData.append("image", data.image);
      }

      files.forEach((file) => {
        formData.append("videos[]", file);
      });

      await api.post(`/course/${id}/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/cours");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          alert("Votre session a expiré ou vous n'avez plus les droits requis.");
          navigate("/");
          return;
        }
        setErrors(error.response.data.errors || null);
        setError(error.response.data.message || "Une erreur est survenue.");
      } else {
        setError(error.message);
      }
    } finally {
      setIsSubmitting(false); // Réactiver le bouton une fois fini
    }
  };

  if (contextLoading || fetchingCourse) {
    return (
      <div className="text-center py-20 text-muted font-bold">
        Chargement des informations du cours...
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          {error && <div className="alert alert-danger shadow-sm">{error}</div>}

          <h1 className="text-2xl font-bold text-center text-slate-800 mb-4">
            Modifier le Cours
          </h1>

          <form onSubmit={sentData} encType="multipart/form-data">
            {/* Titre */}
            <div className="mb-3">
              <label className="form-label font-medium text-slate-700">Titre</label>
              <input
                type="text"
                name="titre"
                onChange={(e) => setData({ ...data, titre: e.target.value })}
                value={data.titre}
                className={`form-control ${errors?.title ? "is-invalid" : ""}`}
              />
              {errors?.title && (
                <div className="invalid-feedback">{errors.title[0]}</div>
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                onChange={(e) => setData({ ...data, description: e.target.value })}
                value={data.description}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            {/* Nouvelle Image de couverture */}
            <div className="mb-3">
              <label className="form-label font-medium text-slate-700">
                Changer l'image de couverture (optionnel)
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => setData({ ...data, image: e.target.files[0] })}
                className="form-control"
              />
            </div>

            {/* Ajouter de nouvelles Vidéos */}
            <div className="mb-4">
              <label className="form-label font-medium text-slate-700">
                Ajouter des nouvelles vidéos
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

              {/* Aperçu des nouvelles vidéos sélectionnées */}
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
                          onClick={() => supNewVideo(index)}
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
                className="btn btn-primary py-2.5 font-medium rounded-xl shadow-sm disabled:opacity-50"
              >
                {isSubmitting
                  ? "Envoi et traitement des modifications..."
                  : "Enregistrer les modifications"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/cours")}
                disabled={isSubmitting}
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

export default UpdateCours;