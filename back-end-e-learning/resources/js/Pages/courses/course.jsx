
const Course = ({course}) => {
    return ( 
    <div className="card m-5 col">
        <div className="card-image">
            <div className="ratio ratio-21x9">
            <img src={course.image} alt="not-found" />
            </div>
        </div>
        <div className="card-body">
        <h3 className="card-title">{course.titre}</h3>
        <p>{course.description}</p>
        <small>{course.nbrVideo} videos</small> 
        <div className="d-grid">
            <Link to={`/courseDetail/${course.id}`}  className="btn btn-outline-success">Commencer</Link>
        </div>
        </div>
    </div> );
}

export default Course;