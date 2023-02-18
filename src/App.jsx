import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Alumnos from './components/usuario/admin/alumnos/Alumnos';
import Bienvenida from './components/usuario/Bienvenida';
import Docentes from './components/usuario/admin/docentes/Docentes';
import Permisos from './components/usuario/admin/permisos/Permisos';
import Materias from './components/usuario/admin/materias/Materias';
import Calificaciones from './components/usuario/alumno/Calificaciones';
import InfoAlumno from './components/usuario/alumno/InfoAlumno';
import CalificarAlumnos from './components/usuario/docente/CalificarAlumnos';
import { UsuarioContext } from './context/UsuarioProvider';
import Navbar from './components/usuario/Navbar';
import EvaluarDocente from './components/usuario/alumno/EvaluarDocente';
import EvaluacionDocentes from './components/usuario/admin/docentes/EvaluacionDocentes';

function App() {
  const {usuario} = React.useContext(UsuarioContext);

  return (
    <div className='App'>
      <Router>

      {
        //Si existe el usuario muestro el navbar desde aquí
        usuario.rol_id !== null && (
          <Navbar />
        )
      }
        <Routes>
          <Route path='/' element={<Login />} />

          {/* Administrador*/}
          <Route path='/bienvenida' element={<Bienvenida />} />
          <Route path='/alumnos' element={<Alumnos />} />
          <Route path='/docentes' element={<Docentes />} />
          <Route path='/permisos' element={<Permisos />} />
          <Route path='/materias' element={<Materias />} />
          <Route path='evaluacionDocentes' element={<EvaluacionDocentes/>} />

          {/* Alumno */}
          <Route path='/calificaciones' element={<Calificaciones />} />
          <Route path='/infoAlumno' element={<InfoAlumno />}/>
          <Route path='/evaluarDocente' element={<EvaluarDocente />} />
        
          {/* Docente */}
          <Route path='/calificar' element={<CalificarAlumnos />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
