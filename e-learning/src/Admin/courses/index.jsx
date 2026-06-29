import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useEffect, useState, useContext } from "react";
import { Cntx } from "../../context/context"; // 🔥 Importation du contexte global

const Cours = () => {
  // 🔥 On extrait le token, le statut de chargement de session, et le profil utilisateur
  const { token, loading, user } = useContext(Cntx);
  const [courses, setcourses] = useState([]);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  // 1. Récupérer les cours à partir de la base de données + Protection d'accès
  useEffect(() => {
    const getCourses = async () => {
      // ⏳ Si l'application charge encore les infos de session de l'utilisateur, on patiente
      if (loading) return;

      // 🔒 Protection : Aucun token trouvé localement
      if (!token) {
        alert("Accès refusé ! Veuillez vous connecter.");
        navigate("/login");
        return;
      }

      // 🚫 Protection : Utilisateur connecté mais pas administrateur
      if (user && user.role !== 'admin' && !user.is_admin) {
        alert("Accès refusé ! Cet espace est réservé aux administrateurs.");
        navigate("/");
        return;
      }

      try {
        const response = await api.get("/index", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // 🔥 Ajout du jeton pour passer le middleware auth:sanctum
          },
        });
        setcourses(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement :", error.response);
        
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
          alert("Accès refusé ! Vous n'avez pas les droits d'administrateur.");
          navigate("/"); 
        }
      }
    };

    getCourses();
  }, [result, navigate, token, loading, user]); // 🔥 Synchronisation complète des dépendances

  // 2. Gestion de la disparition automatique de l'alerte
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setResult(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [result]);

  // 3. Supprimer un cours
  const delCourse = async (id) => {
    const conf = window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?');
    if (!conf) return;

    try {
      const response = await api.delete(`/course/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // 🔥 Sécurisation de la requête de suppression
        },
      });
      setResult({ type: "success", message: response.data.message || "Cours supprimé !" });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          alert("Votre session a expiré ou vous n'avez plus les droits.");
          navigate("/");
          return;
        }
        const errMsg = error.response.data.message || error.response.data || "Une erreur est survenue.";
        setResult({ type: "danger", message: errMsg });
      } else {
        setResult({ type: "danger", message: error.message });
      }
    }
  };

  // ⏳ Écran d'attente pendant la validation des accès admin
  if (loading) {
    return <div className="text-center py-20 font-bold text-secondary">Vérification des droits d'accès...</div>;
  }

  return (
    <div className="container my-4">
      {result && (
        <div className={`alert alert-${result.type}`} role="alert">
          {result.message}
        </div>
      )}

      <h2 className="text-center p-3 bg-secondary text-light rounded shadow-sm">
        La Liste des Cours (Admin)
      </h2>
      
      <div className="row justify-content-end my-3">
        <div className="col-auto">
          <Link to={"/AddCours"} className="btn btn-primary px-4 shadow-sm">
            + Ajouter un cours
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-2 bg-white">
        <table className="w-full border-collapse text-left text-sm text-gray-500">
          <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Titre du cours</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-400 italic">
                  Aucun cours trouvé ou chargement en cours...
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-950 align-middle">
                    {c.title}
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="d-flex gap-2">
                      <Link to={`/updateCour/${c.id}`} className="btn btn-sm btn-warning">
                        Modifier
                      </Link>
                      <button onClick={() => delCourse(c.id)} className="btn btn-sm btn-danger">
                        Supprimer
                      </button>
                      <Link to={`/course/${c.id}`} className="btn btn-sm btn-info text-white">
                        Info
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cours;