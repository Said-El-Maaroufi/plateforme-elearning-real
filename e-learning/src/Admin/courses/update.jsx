import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./api/axios"; // Importe ton instance Axios configurée

export default function UpdateCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  // État du formulaire
  const [data, setData] = useState({
    title: "",
    description: "",
    image: null, // Nouveau fichier binaire si sélectionné
  });

  // États pour l'interface utilisateur
  const [currentImage, setCurrentImage] = useState(null); // URL de l'image existante depuis Laravel
  const [previewUrl, setPreviewUrl] = useState(null); // Prévisualisation de la nouvelle image sélectionnée
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 1. Récupérer les données du cours à modifier
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/course/${id}/edit`);
        const course = response.data.course || response.data;

        setData({
          title: course.title || course.titre || "",
          description: course.description || "",
          image: null, // On garde null pour ne pas surcharger si pas de nouvelle image
        });

        // Récupérer le chemin de l'image existante
        if (course.image) {
          setCurrentImage(course.image);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du cours :", err);
        alert("Impossible de charger les données du cours.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // 2. Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file)); // Crée une URL temporaire pour la prévisualisation
    }
  };

  // 3. Soumettre les modifications à Laravel
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);

    // Astro-astuce Laravel : PHP/Laravel ne lit pas 'multipart/form-data' lors d'une vraie requête PUT.
    // On fait donc un POST avec le champ _method: "PUT"
    formData.append("_method", "PUT");

    // N'ajouter l'image au FormData que si un nouveau fichier a été sélectionné
    if (data.image) {
      formData.append("image", data.image);
    }

    try {
      await api.post(`/course/${id}/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Le cours a été mis à jour avec succès !");
      navigate("/courses"); // Redirection vers la liste
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert("Une erreur est survenue lors de la mise à jour.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction utilitaire pour générer l'URL complète d'une image stockée dans storage
  const getStorageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    // URL de base Render sans le /api de la fin
    return `https://learnhub-backend-07qn.onrender.com/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-600 font-medium">Chargement des données du cours...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto m-6 p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Modifier le cours #{id}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
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
              errors.title
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:ring-indigo-200 focus:border-indigo-500"
            }`}
            placeholder="Ex: Formation React & Laravel"
            required
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows="4"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:ring-indigo-200 focus:border-indigo-500"
            }`}
            placeholder="Description détaillée du cours..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
          )}
        </div>

        {/* Gestion de l'image */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Image de couverture
          </label>

          {/* Zone d'affichage / prévisualisation de l'image */}
          <div className="flex items-center gap-4 mb-3">
            {previewUrl ? (
              <div>
                <p className="text-xs text-indigo-600 font-semibold mb-1">
                  Nouvelle image sélectionnée :
                </p>
                <img
                  src={previewUrl}
                  alt="Nouvelle couverture"
                  className="w-32 h-20 object-cover rounded-lg border-2 border-indigo-400 shadow-sm"
                />
              </div>
            ) : currentImage ? (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">
                  Image actuelle :
                </p>
                <img
                  src={getStorageUrl(currentImage)}
                  alt="Couverture actuelle"
                  className="w-32 h-20 object-cover rounded-lg border border-slate-200 shadow-sm"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Aucune image enregistrée pour ce cours.</p>
            )}
          </div>

          {/* Champ d'upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="text-xs text-slate-400 mt-1">
            Laissez vide si vous souhaitez conserver l'image actuelle.
          </p>
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">{errors.image[0]}</p>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 transition"
          >
            {submitting ? "Mise à jour en cours..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}