import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Cntx } from "../../context/context";

export default function UpdateCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, loading: contextLoading, user } = useContext(Cntx);

  // Données du cours
  const [data, setData] = useState({
    title: "",
    description: "",
    image: null,
  });

  // Images
  const [currentImage, setCurrentImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Vidéos
  const [existingVideos, setExistingVideos] = useState([]); // Vidéos venant du backend
  const [newVideoFiles, setNewVideoFiles] = useState([]);  // Fichiers vidéo choisis par l'utilisateur
  const [newVideoPreviews, setNewVideoPreviews] = useState([]); // URLs blob pour prévisualisation

  // États UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [errors, setErrors] = useState({});

  // Protection Administrateur
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

  // 1. Récupération des données du cours et de ses vidéos
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/course/${id}/edit`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Adapte selon la structure renvoyée par showEdit()
        const courseData = response.data.course || response.data;
        const videosData = response.data.course_videos || courseData.videos || [];

        setData({
          title: courseData.title || courseData.titre || "",
          description: courseData.description || "",
          image: null,
        });

        if (courseData.image) {
          setCurrentImage(courseData.image);
        }

        setExistingVideos(videosData);
      } catch (err) {
        console.error("Erreur lors de la récupération du cours :", err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          alert("Impossible de charger le cours.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourse();
    }
  }, [id, token, navigate]);

  // 2. Gestion de l'image de couverture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. Gestion des NOUVELLES vidéos sélectionnées
  const handleNewVideosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setNewVideoFiles((prev) => [...prev, ...files]);

    const newUrls = files.map((file) => URL.createObjectURL(file));
    setNewVideoPreviews((prev) => [...prev, ...newUrls]);
  };

  const removeNewVideo = (index) => {
    URL.revokeObjectURL(newVideoPreviews[index]);
    setNewVideoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 4. Suppression d'une vidéo EXISTANTE déjà en base de données
  const handleDeleteExistingVideo = async (videoId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette vidéo du cours ?")) {
      return;
    }

    setDeletingVideoId(videoId);
    try {
      // Endpoint dédié pour supprimer une vidéo par son ID
      await api.delete(`/video/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Retirer la vidéo de l'état local
      setExistingVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error("Erreur de suppression vidéo :", err);
      alert("Impossible de supprimer la vidéo.");
    } finally {
      setDeletingVideoId(null);
    }
  };

  // 5. Soumission des modifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("_method", "PUT"); // Contournement pour multipart/form-data dans Laravel

    if (data.image) {
      formData.append("image", data.image);
    }

    // Ajout du tableau de nouvelles vidéos
    newVideoFiles.forEach((file) => {
      formData.append("videos[]", file);
    });

    try {
      await api.post(`/course/${id}/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Le cours a été mis à jour avec succès !");
      navigate("/cours");
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert("Une erreur est survenue lors de l'enregistrement.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStorageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `https://learnhub-backend-07qn.onrender.com/storage/${path}`;
  };

  if (contextLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-600 font-medium">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Modifier le cours #{id}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Titre du cours
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.title ? "border-red-500" : "border-slate-300 focus:ring-indigo-200"
            }`}
            required
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows="3"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Couverture Image */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Image de couverture
          </label>
          <div className="flex items-center gap-4 mb-3">
            {previewUrl ? (
              <img src={previewUrl} alt="Aperçu" className="w-28 h-18 object-cover rounded border-2 border-indigo-500" />
            ) : currentImage ? (
              <img src={getStorageUrl(currentImage)} alt="Actuelle" className="w-28 h-18 object-cover rounded border" />
            ) : null}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {/* Vidéos EXISTANTES */}
        <div>
          <h3 className="text-md font-semibold text-slate-800 mb-2">
            Vidéos actuelles du cours ({existingVideos.length})
          </h3>
          {existingVideos.length === 0 ? (
            <p className="text-xs text-slate-400 italic mb-4">Aucune vidéo enregistrée pour le moment.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {existingVideos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">#{video.order || video.id}</span>
                    <span className="text-sm font-medium text-slate-700">{video.title || video.file}</span>
                  </div>
                  <button
                    type="button"
                    disabled={deletingVideoId === video.id}
                    onClick={() => handleDeleteExistingVideo(video.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition"
                  >
                    {deletingVideoId === video.id ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NOUVELLES Vidéos à ajouter */}
        <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Ajouter de nouvelles vidéos
          </label>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleNewVideosChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
          />
          {errors.videos && <p className="text-red-500 text-xs mt-1">{errors.videos[0]}</p>}

          {/* Prévisualisation des nouvelles vidéos */}
          {newVideoPreviews.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-700">Vidéos prêtes à être envoyées :</p>
              {newVideoPreviews.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-indigo-100">
                  <video src={url} className="w-32 h-20 bg-black rounded" controls />
                  <span className="text-xs text-slate-600 truncate max-w-xs">{newVideoFiles[idx]?.name}</span>
                  <button
                    type="button"
                    onClick={() => removeNewVideo(idx)}
                    className="text-xs text-red-500 font-semibold hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/cours")}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Traitement FFmpeg & Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}