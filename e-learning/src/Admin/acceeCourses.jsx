import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Cntx } from "../context/context"; // 🔥 Contexte global pour le token

const Accee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, loading: contextLoading, user: currentUser } = useContext(Cntx);

  const [userTarget, setUserTarget] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" }); // Pour gérer les alertes success/danger

  // 🔒 Protection de la route (Admin uniquement)
  useEffect(() => {
    const fetchData = async () => {
      if (contextLoading) return;

      if (!token) {
        alert("Accès refusé ! Veuillez vous connecter.");
        navigate("/login");
        return;
      }

      if (currentUser && currentUser.role !== 'admin' && !currentUser.is_admin) {
        alert("Accès refusé ! Cet espace est réservé aux administrateurs.");
        navigate("/");
        return;
      }

      try {
        const response = await api.get(`/accee/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setUserTarget(response.data.user);
        setCourses(response.data.courses);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la récupération des données.");
        navigate("/users");
      }
    };

    fetchData();
  }, [id, navigate, token, contextLoading, currentUser]);

  // 🚀 Soumission du formulaire (Donner ou Retirer)
  const handleAccess = async (actionType) => { 
    if (!selectedCourse) {
      setMessage({ text: "Veuillez sélectionner un cours dans la liste.", type: "danger" });
      return;
    }

    setMessage({ text: "", type: "" });

    try {
      const response = await api.post("/accee/update", {
        user_id: userTarget.id,
        course_id: selectedCourse,
        action: actionType
      }, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      setMessage({ text: response.data.message, type: "success" });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        // Affiche "Cet utilisateur possède déjà l'accès..." ou autres messages renvoyés par Laravel
        setMessage({ text: err.response.data.message, type: "danger" });
      } else {
        setMessage({ text: "Une erreur système est survenue.", type: "danger" });
      }
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500 font-bold">Vérification et chargement...</div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          
          <div className="mb-3">
            <Link to="/users" className="text-decoration-none text-slate-500 text-sm font-medium">
              ← Retour à la liste
            </Link>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">Gérer les accès</h2>
            <p className="text-sm text-slate-500 text-center mb-4">
              Utilisateur : <span className="font-bold text-indigo-600">{userTarget.name}</span> ({userTarget.email})
            </p>

            {/* Affichage des retours d'information (Messages de succès ou d'erreur déjà existant) */}
            {message.text && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} text-sm rounded-xl py-2 px-3 mb-3 shadow-sm`}>
                {message.text}
              </div>
            )}

            <div className="mb-4">
              <label className="form-label font-medium text-slate-700">Sélectionner un cours</label>
              <select
                className="form-select rounded-xl border-slate-200 text-slate-700"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">-- Choisir une formation --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                onClick={() => handleAccess("donner")}
                className="btn btn-success py-2.5 font-medium rounded-xl shadow-sm transition-all"
              >
                ➕ Donner l'accès
              </button>
              
              <button
                type="button"
                onClick={() => handleAccess("retirer")}
                className="btn btn-outline-danger py-2.5 font-medium rounded-xl transition-all"
              >
                ❌ Retirer l'accès
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Accee;