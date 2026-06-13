import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Create() {
    
    const {data, setData, reset, post, processing, errors} = useForm({
        title : '',
        image : '', 
        video : ''
    })
    

    return (
        <div className="container mt-5" >
            <h2 className="mb-4">Ajouter un nouveau cours</h2>
            <form >
                {/* Titre */}
                <div className="mb-3">
                    <label className="form-label">Titre du cours</label>
                    <input 
                        type="text" 
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        value={data.title}
                        onChange={e => setData('title',e.target.value)}
                    />
                    {errors.title && <p className='text-danger'>{errors.title}</p>}

                </div>

                {/* Image */}
                <div className="mb-3">
                    <label className="form-label">Image de couverture</label>
                    <input 
                        type="file" 
                        value={data.image}
                        className={`form-control ${errors.image ? 'is-invalid' : ''}` }
                        onChange={e => setData('image', e.target.files[0])}
                    />
                    {errors.image && <p className='text-danger'>{errors.image}</p>}

                </div>

                {/* Vidéo */}
                <div className="mb-3">
                    <label className="form-label">Fichier Vidéo</label>
                    <input 
                        type="file" 
                        className={`form-control ${errors.video} ? 'is-invalid' : ''`}
                        value={data.video}
                        onChange={e => setData('video',e.target.files[0])}
                    />
                    {errors.video && <p className='text-danger'>{errors.video}</p>}
                </div>

                <button 
                    type="submit" 
                    className="btn btn-success" 
                    disabled={processing}
                >
                    {processing ? 'chargement...' : 'creer le cours'}
                </button>
                <a className='btn btn-outline-secondary' href={route('courses.courses')}>Retour</a>
            </form>
        </div>
    );
}