import React from 'react';
import { UsuarioContext } from '../../context/UsuarioProvider';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const Bienvenida = () => {
    const navegar = useNavigate();
    const {usuario} = React.useContext(UsuarioContext);
    
    React.useEffect(()=>{
        //Si no hay usuario o no es administrador lo regreso 
        if (!auth.currentUser || usuario.rol_id !== 'E2gFLIgUTOZyyXr1h3pb') {
            navegar('/');
        }
    },[usuario]);

  return (
    <div>
      Bienvenido, {usuario.usuario}
    </div>
  )
}

export default Bienvenida