import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cntx } from '../context/context';

// À l'intérieur de ton composant (ex: Navbar) :
const { setToken, setUser } = useContext(Cntx);
const navigate = useNavigate();

const handleLogout = () => {
    // 1. On nettoie le stockage local
    localStorage.removeItem('token');
    
    // 2. On met à jour le Contexte immédiatement pour actualiser la Navbar et les accès
    if (setToken) setToken(null);
    if (setUser) setUser(null);
    
    // 3. On redirige en douceur sans recharger la page
    navigate('/'); 
};