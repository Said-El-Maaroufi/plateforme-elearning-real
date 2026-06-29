import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Cntx } from "../context/context";

const ListeUsers = () => {
  // 🔥 On récupère le token et l'état loading du contexte global
  const { user, token, loading, setAccee, setDroitDaccee } = useContext(Cntx);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  // Gestion de la disparition automatique des messages d'erreur
  useEffect(() => {
    if (err) {
      const timer = setTimeout(() => {
        setErr(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [err]);

  // Récupérer les utilisateurs (Seul l'admin authentifié peut appeler cette API)
  useEffect(() => {
    const fetchUser = async () => {
      // 🔒 2. Si ni user ni token ni l'accee
      setAccee(true);

      // ⏳ 1. Si le contexte charge encore les infos de session, on attend
      if (loading) return;

      // 🚫 3. Si le user est chargé mais n'est pas admin (évite de lancer une requête inutile)
      if (user && user.role !== "admin") {
        return;
      }

      try {
        const res = await api.get("/users", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // 🔥 Correction : Envoi du Token à Laravel Sanctum
          },
        });

        setUsers(res.data.users || res.data);
      } catch (error) {
        console.error(error);

        if (error.response) {
          const status = error.response.status;
          const serverMessage = error.response.data?.message;

          // Protection : Jeton expiré ou invalide (401)
          if (status === 401) {
            localStorage.setItem(
              "message",
              "Votre session a expiré. Veuillez vous reconnecter.",
            );
            navigate("/login");
            return;
          }

          // Protection : Refusé par le middleware Admin de Laravel (403)
          if (status === 403) {
            localStorage.setItem(
              "message",
              serverMessage || "Accès refusé. Réservé aux administrateurs.",
            );
            navigate("/");
            return;
          }

          setErr(
            serverMessage || "Une erreur est survenue lors de la récupération.",
          );
        } else {
          setErr(error.message || "Impossible de contacter le serveur.");
        }
      }
    };

    fetchUser();
  }, [navigate, token, loading, user]); // 🔥 Dépendances synchronisées

  // Écran d'attente pendant que le contexte vérifie si tu es admin
  if (loading) {
    return (
      <div className="text-center py-20 font-bold text-secondary">
        Vérification des droits administrateur...
      </div>
    );
  }

  return (
    <div className="container my-5">
      {err && <div className="alert alert-danger shadow-sm">{err}</div>}

      <h2 className="text-center p-3 bg-secondary text-light rounded shadow-sm mb-4">
        La Liste des Étudiants (Vue Admin)
      </h2>

      <div className="table-responsive rounded shadow-sm border bg-white p-2">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" style={{ width: "10%" }}>
                ID
              </th>
              <th scope="col">Nom complet</th>
              <th scope="col">Adresse Email</th>
              <th scope="col" className="text-end" style={{ width: "25%" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted italic py-4">
                  Aucun étudiant trouvé 
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="font-monospace">{u.id}</td>
                  <td className="fw-bold text-dark">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="text-end">
                    <div className="btn-group gap-2">
                      <Link
                        to={`/accee/${u.id}`}
                        className="btn btn-sm btn-outline-warning"
                      >
                        Modifier
                      </Link>
                      <Link
                        to={`/user/${u.id}`}
                        className="btn btn-sm btn-outline-info"
                      >
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

export default ListeUsers;
