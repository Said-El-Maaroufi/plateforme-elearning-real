import Course from "./course";
const Courses = ({courses}) => {
    return ( 
        <>
    <div className="container-fluid bg-light">
        <div className="row p-3 ">
            <div className="col-11 ">
            <p className="text-primary">E-learning</p>
            </div>
            <div className="col-1 ">
                <a className="btn btn-outline-primary" href={route('courses.create')}>Ajouter</a>
            </div>
            </div>
    </div>
    
<div className="row p-3">
            {<p className="text-muted">not found... </p> || courses.map((c) => (
                <Course course={c}/>
            ))}
            </div>
        </>
            );
}

export default Courses;