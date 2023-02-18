import React from 'react';
import { NavLink } from 'react-router-dom';
import { UsuarioContext } from '../../context/UsuarioProvider';

const Navbar = () => {
    const {usuario, cerrarSesion} = React.useContext(UsuarioContext);

    React.useEffect(()=>{
        console.log(usuario.rolId);
    },[])

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-dark">
        <a className="navbar-brand text-success ms-3">Gestor escolar</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
                {
                    usuario.rolId === 'E2gFLIgUTOZyyXr1h3pb' && (
                        <ul className="navbar-nav">
                            <li className="nav-item active">
                                <NavLink className='nav-link text-decoration-none text-light' to="/alumnos">
                                    Alumnos
                                </NavLink>
                            </li>
                            <li className="nav-item dropdown">
                                <NavLink className='nav-link text-decoration-none text-light' to="/docentes">
                                    Docentes
                                </NavLink>
                            </li>
                            <li className="nav-item dropdown">
                                <NavLink className='nav-link text-decoration-none text-light' to="/evaluacionDocentes">
                                    Evaluación docentes
                                </NavLink>
                            </li>
                            <li className="nav-item active">
                                <NavLink className='nav-link text-decoration-none text-light' to="/permisos">
                                    Permisos
                                </NavLink>
                            </li>
                            <li className="nav-item active">
                                <NavLink className='nav-link text-decoration-none text-light' to='/materias'>
                                    Materias
                                </NavLink>
                            </li>
                        </ul>
                    )
                }

                {
                    usuario.rolId === 'oFf9o1Gyi7W2FYwgIjWw' && (
                        <ul className="navbar-nav ">
                            <li className="nav-item active">
                                <NavLink className='nav-link text-decoration-none text-light' to="/calificaciones">
                                    Calificaciones
                                </NavLink>
                            </li>
                            <li className="nav-item active">
                                <NavLink className='nav-link text-decotarion-none text-light' to='/infoAlumno'>
                                    Mi información
                                </NavLink>
                            </li>
                            <li className="nav-item active">
                                <NavLink className='nav-link text-decoration-none text-light' to='evaluarDocente'>
                                    Evaluar docente
                                </NavLink>
                            </li>
                        </ul>
                    )
                }

                {
                    usuario.rolId === 'msEw7AqdvvUtjD4FEJoO' && (
                        <ul className="navbar-nav">
                            <li className="nav-item active">
                                <NavLink className='nav-link text-decoration-none text-light' to='/calificar'>
                                    Calificaciones
                                </NavLink>
                            </li>
                        </ul>
                    )
                }
                <li className='nav-item active'>
                                <button className='btn btn-dark' onClick={cerrarSesion}>Salir</button>
                </li>
        </div>
    </nav>
  )
}

export default Navbar