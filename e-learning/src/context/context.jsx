import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export const Cntx = createContext();

export default function Context({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accee, setAccee] = useState(false);
    const [droitDaccee, setDroitDaccee] = useState(true);
    const navigate = useNavigate()

    // 🔄 Charger le profil de l'utilisateur

    useEffect(()=>{
        if(accee && !token){
            localStorage.setItem('message', 'merci de connecter après')
            navigate('/login')
        }else if(token && !droitDaccee){
            localStorage.setItem('message', "vous n'avez pas le droit")
            navigate('/')
        }
    }, [accee, droitDaccee])

    
    useEffect(() => {
        
        const fetchUser = async () => {
            if (!token) {
                setError(null);
                setLoading(false);
                return;
            }
            setError(null)
            setLoading(true);
            try {
                const res = await api.get('/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(res.data);
                setError(null)
            } catch (error) {
                    setError(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    // 🔥 FONCTION LOGOUT GLOBALE
    const logout = async () => {
        try {
            // 1. On prévient Laravel de supprimer le token actuel en base de données
            if (token) {
                await api.post('/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    localStorage.setItem('message', res.data.message)
                });
            }
        } catch (err) {
            localStorage.setItem('logoutError', `Erreur lors de la déconnexion côté serveur :${err}`)
        } finally {
            // 2. Quoi qu'il arrive (succès ou échec de l'API), on nettoie l'application côté client
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <Cntx.Provider value={{ user, setUser, token, setToken, error, loading, logout, setAccee, setDroitDaccee }}>
            {children}
        </Cntx.Provider>
    );
}