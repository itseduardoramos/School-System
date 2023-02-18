import React from 'react'
import { UsuarioContext } from '../context/UsuarioProvider';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [user, setUser] = React.useState('admin');
  const [password, setPassword] = React.useState('123456');
  const [mensaje, setMensaje] = React.useState(false);
  const {usuario, iniciarSesion} = React.useContext(UsuarioContext)
  
  const navegar = useNavigate();

  const Login = async(e) => {
    e.preventDefault();

    if(!user && !password){
      setMensaje('Agrega ambos campos');
      return;
      }

      if(!user){
        setMensaje('Agrega un usuario');
      return;
      }

      if(!password){
        setMensaje('Agrega contraseña');
      return;
      }

    const res = await iniciarSesion(user, password);
    
    if (res === "true") {
      navegar('/bienvenida');
    }else{
      setMensaje('Usuario y/o contraseña incorrectos');
    }
  }

  return (
    <div>
      <form onSubmit={Login}>
        <input type='text' placeholder='usuario' value={user} onChange={e => setUser(e.target.value)}/>
        <input type='password' placeholder='contraseña' value={password} onChange={e => setPassword(e.target.value)} />
        <button type='submit'>Ingresar</button>
      </form>
      {
        mensaje && (
          <h5>{mensaje}</h5>
        )
      }
    </div>
  )
}

export default Login