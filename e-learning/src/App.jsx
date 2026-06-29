import HomePage from "./components/HomePage";
import Navbar from "./components/Navbar";
import Register from "./auth/register";
import Login from "./auth/login";
import CourseInfo from "./Admin/courses/show";
import CourseWorkspace from "./components/CourseWorkspace";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ListeUsers from "./Admin/users";
import CoursesList from "./components/courses";
import Cours from "./Admin/courses";
import AddCours from "./Admin/courses/ajouter";
import { useState } from "react";
import UpdateCour from "./Admin/courses/update";
import ShowUser from "./Admin/showUser";
import Accee from "./Admin/acceeCourses";
import CreateProf from "./superAdmin/createProf";


const App = () => {

const  [err, setErr] = useState(null)
  
  
  
  return ( 
    <>
    <Navbar/>
    <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login />}/>


        {/* les composents reservés au admin */}

        <Route path="/cours" element={<Cours />}/>
        <Route path="/AddCours" element={<AddCours />}/>
        <Route path="/updateCour/:id" element={<UpdateCour />}/>
        <Route path="/course/:id" element={<CourseInfo/>}/>
        <Route path="/users" element={<ListeUsers />}/>
        <Route path="/accee/:id" element={<Accee />}/>
      
        {/* les composents reservés au user */}
        <Route path="/courses" element={<CoursesList/>}/>
        <Route path="/cour/:courseId" element={<CourseWorkspace />} />
        <Route path="/user/:id" element={<ShowUser />} />

        {/* les composents reserver au superAdmin */}
        <Route path="/superadmin/prof" element={<CreateProf />} />

        
        {/* </Route> */}
        
        {/*  Route 404  */}
        <Route path="*" element={<HomePage/>}/>

      </Routes>
    </>

   );
}
 
export default App;