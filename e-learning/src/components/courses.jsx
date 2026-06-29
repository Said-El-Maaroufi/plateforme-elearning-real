import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Cntx } from "../context/context"; // 🔥 Importation du contexte

const CoursesList = () => {
  const { token, setAccee, user, setDroitDaccee, accee } = useContext(Cntx); // 🔥 Récupération du token actuel
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setAccee(true);
  }, [accee]);

  useEffect(() => {
    // Optionnel : Si l'application sait déjà localement qu'il n'y a pas de token, on évite d'appeler l'API
    if(!token){
        return;
    }
    api
      .get("/courses", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // 🔥 Injection du jeton pour Laravel Sanctum
        },
      })
      .then((response) => {
        setCourses(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Impossible de charger les cours.");
        setLoading(false);
      });
  }, [navigate, token]); // 🔥 Ajout de token dans les dépendances pour recharger si l'utilisateur change

  if (loading)
    return (
      <div className="text-center py-20 font-medium text-gray-500">
        Chargement des cours...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-500 font-medium">{error}</div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
        Nos Cours Disponibles
      </h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-500 py-10 italic">
          Aucun cours disponible pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 w-full bg-gray-200">
                <img
                  src={
                    course.image
                      ? `http://127.0.0.1:8000/storage/${course.image}`
                      : "https://via.placeholder.com/400"
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-950 mb-2 line-clamp-1">
                  {course.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {course.description || "Aucune description fournie."}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/cour/${course.id}`)}
                    className="w-full  bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5  rounded-lg transition-colors text-center shadow-sm"
                  >
                    Commencer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
