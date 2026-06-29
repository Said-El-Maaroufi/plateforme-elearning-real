import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { Cntx } from "../context/context";
import { useNavigate } from "react-router-dom";

const CreateProf = () => {

const {token, setAccee} = useContext(Cntx) 
const [credentials, setCredentials] = useState({email : '', password: '' })
const [msg, setMsg] = useState(null) 
const [error, setError] = useState()
const [errors, setErrors] = useState([])
const navigate = useNavigate()

    useEffect(() => {
        setAccee(true)
    }, [])
    
    
    
    

  const [data, setData] = useState({
    name: "",
    email: "",
  });

  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);

  const sentData = (e) => {
    e.preventDefault();

    try {
        const res = api.post("/superadmin/prof", formData, {
            headers: {
                Accept: "applicatio/json",
                Authorization: `bearer ${token}`,
            },
        });
        setCredentials(res.data.credentials)
        setMsg(res.data.message)

    } catch (error) {
        if(error.response && error.response.status === 422){
            setErrors(error.response.data.errors)
        }
        setError(error.response?.data?.message || error.message)
    }
  };


  return (
    <div className="max-w-md mt-5 mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      {/* En-tête */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Ajouter un Enseignant
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Le mot de passe sera généré automatiquement.
        </p>
      </div>

      {/* Formulaire */}
      <form className="space-y-5" onSubmit={sentData}>
        {/* Champ Nom Complet */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nom Complet
          </label>
          <input
            onChange={(e) =>
              setData({ ...data, [e.target.name]: e.target.value })
            }
            name="name"
            type="text"
            placeholder="Ex: Ahmed Mansouri"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          {errors?.name && <p className="text-red-500">{errors.name}</p>}
        </div>

        {/* Champ Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Adresse Email
          </label>
          <input
            onChange={(e) =>
              setData({ ...data, [e.target.name]: e.target.value })
            }
            name="email"
            type="email"
            placeholder="prof.ahmed@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
        {errors?.email && <p className="text-red-500">{errors.email}</p>}

        </div>

        {/* Bouton de Soumission */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Créer le compte
        </button>
      </form>
    </div>
  );
};

export default CreateProf;
