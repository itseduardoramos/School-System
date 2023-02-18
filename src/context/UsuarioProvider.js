import React from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const UsuarioContext = React.createContext();

const UsuarioProvider = (props) => {
    const dataUsuario = {clave: null, id: null, matricula: null, rol_id: null, usuario: null};
    const [usuario, setUsuario] = React.useState(dataUsuario);

    React.useEffect(()=>{
        detectarUsuario();
        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);

    const detectarUsuario = (id, usuario, clave, rolId, matricula) => {

        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('hay usuario')
                setUsuario({id: id, usuario: usuario, clave: clave, rolId: rolId, matricula: matricula});
            }else{
                console.log("no hay")
                setUsuario({id: null, clave: null, matricula: null, rol_id: null, usuario: null});
            }
        });
    }

    const iniciarSesion = async(user, password) => {
        try {
            if(!user && !password){
            return;
            }

            if(!user){
            return;
            }

            if(!password){
            return;
            }

            const correoUsuario = user + "@gmail.com";
            await signInWithEmailAndPassword(auth, correoUsuario, password);

            const matricula = parseInt(user);
            
            const usuario = await getDoc(doc(db, 'usuarios', user));
            const infoUsuario = usuario.data();

            if (usuario.exists()) {
                detectarUsuario(matricula, infoUsuario.usuario, infoUsuario.clave, infoUsuario.rolId, user);

            }else{
                return;
            }

            console.log(infoUsuario.rolId)

            return "true";
            
        } catch (error) {
            console.log(error);
            return
        }
    }

    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        signOut(auth);
    }

  return (
    <UsuarioContext.Provider value={{usuario, setUsuario, iniciarSesion, cerrarSesion}}>
        {props.children}
    </UsuarioContext.Provider>
  )
}

export default UsuarioProvider