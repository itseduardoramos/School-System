import React from 'react';
import { addDoc, collection, getDocs, doc, query, setDoc, where } from 'firebase/firestore';
import { db, auth } from '../../../../firebase';
import { UsuarioContext } from '../../../../context/UsuarioProvider';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const EditarDocente = (props) => {
    const navegar = useNavigate();
    const {usuario} = React.useContext(UsuarioContext);
    const [editarRegistro, setEditarRegistro] = React.useState([]);
    const [docenteId, setDocenteId] = React.useState('');
    const [nombre, setNombre] = React.useState('');
    const [apepat, setApepat] = React.useState('');
    const [apemat, setApemat] = React.useState('');
    const [matricula, setMatricula] = React.useState('');
    const [fechaNac, setFechaNacimiento] = React.useState();
    const [telefono, setNumeroTelefono] = React.useState();
    const [materia, setMateria] = React.useState('');
    const [materia2, setMateria2] = React.useState('')
    const [materias, setMaterias] = React.useState([]);
    const [rol, setRol] = React.useState('');
    const [roles, setRoles] = React.useState([]);

    const [mensaje, setMensaje] = React.useState('');
  
    React.useEffect(()=>{
        if (!auth.currentUser || usuario.rolId !== 'E2gFLIgUTOZyyXr1h3pb') {
            navegar('/');
          }else{
            obtenerInfoTablas();
            console.log(props.nombre)
          }
        
    },[]);

    const obtenerInfoTablas = async() =>{
        const materias = await getDocs(collection(db, 'materias'));
        const arrayMaterias = materias.docs.map(item => ({id: item.id, ...item.data()}));
        setMaterias(arrayMaterias);

        const roles = await getDocs(collection(db, 'roles'));
        const arrayRoles = roles.docs.map(item => ({id: item.id, ...item.data()}));
        setRoles(arrayRoles);
    }

    const agregarDocente = async(e) => {
        e.preventDefault();
        if (!nombre || !apepat || !apemat || !matricula || !telefono || !materia) {
            setMensaje('Llene los campos requeridos');
        }
        
        const correo = matricula + '@gmail.com';
        const clave = '123456';

        try {
            const res = await createUserWithEmailAndPassword(auth, correo, clave);

            await setDoc(doc(db, 'usuarios', res.user.uid), {
                matricula: matricula,
                usuario: matricula,
                nombre: nombre,
                clave, clave,
                rol_id: rol
            });

            await addDoc(collection(db, 'docentes'), {
                nombre: nombre,
                apepat: apepat,
                apemat: apemat,
                matricula: matricula,
                fechaNac: fechaNac,
                telefono: telefono,
                rol_id: rol
            });

            const q = query(
                collection(db, 'docentes'),
                where('matricula', '==', matricula)
            );

            const consulta = await getDocs(q);
            const docenteId = consulta.docs.map(item => ({id: item.id}));

            //Si va a impartir 2 materias las agrego, sino agrego solo 1
            if (materia2) {
                await addDoc(collection(db, 'docente_materias'),{
                    materia: materia,
                    docenteId: docenteId[0].id
                });

                await addDoc(collection(db, 'docente_materias'),{
                    materia: materia2,
                    docenteId: docenteId[0].id
                });

            }else{
                await addDoc(collection(db, 'docente_materias'),{
                    materia: materia       
                })
            }

            setNombre('');
            setApepat('');
            setApemat('');
            setMatricula('');;
            setNumeroTelefono('');
            setRol('');


        } catch (error) {
            
        }
        
    }
  return (
    <div className="col-xl-4 border border-secondary">
          <form className="card" onSubmit={agregarDocente}>
            {
              editarRegistro === true ? (
                <h3 className='mt-3 mb-3 ms-3'>Ediatr docente</h3>
              ) : (
                <h3 className='mt-3 mb-3 ms-3'>Alta docente</h3>
              )
            }
            <div className="card-body">
                {
                    mensaje && (
                        <div className="alert alert-danger">
                            {mensaje}
                        </div>
                    )
                }
              <div className="input-group mb-3">
                <input type="text" className='form-control' placeholder='Nombre(s)' value={nombre} onChange={e => setNombre(e.target.value)}/>
                <input type="text" className='form-control' placeholder='Apellido paterno' value={apepat} onChange={e => setApepat(e.target.value)}/>
                <input type="text" className='form-control' placeholder='Apellido materno' value={apemat} onChange={e => setApemat(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <input type="text" className='form-control' placeholder='Matrícula' value={matricula} onChange={e => setMatricula(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <input type="date" className='form-control' value={fechaNac} onChange={e => setFechaNacimiento(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <input type="number" className='form-control' placeholder='teléfono' value={telefono} onChange={e => setNumeroTelefono(e.target.value)} />
              </div>
              <select className="form-select mt-3 mb-3" onChange={e => setMateria(e.target.value)}>
                <option value='1'>Materia</option>
                {
                    materias.map((item, index) => 
                        <option value={item.id} key={index}>{item.nombre}</option>
                    )
                }
              </select>
              <select className="form-select mt-3 mb-3" onChange={e => setMateria2(e.target.value)}>
                <option value='1'>Materia 2</option>
                {
                    materias.map((item, index) => 
                        <option value={item.id} key={index}>{item.nombre}</option>
                    )
                }
              </select>
              <select className="form-select mt-3 mb-3" onChange={e => setRol(e.target.value)}>
                <option value='1' selected>Rol</option>
                {
                    roles.map((item, index) => 
                        <option value={item.id} key={index}>{item.nombre}</option>
                    )
                }
              </select>
            </div>
            <button className="btn btn-dark mb-3" type='submit'>Registrar docente</button>

          </form>
        </div>
  )
}

export default EditarDocente