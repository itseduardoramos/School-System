import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, addDoc, where, getDocs, setDoc, updateDoc} from 'firebase/firestore';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UsuarioContext } from '../../../../context/UsuarioProvider';
import { db, auth } from '../../../../firebase';

const Docentes = () => {
  const navegar = useNavigate();

  const {usuario} = React.useContext(UsuarioContext);

  const [editarRegistro, setEditarRegistro] = React.useState(null);
  const [matDisponible, setMatDisponible] = React.useState(null);

  const [docenteId, setDocenteId] = React.useState('');
  const [nombre, setNombre] = React.useState('');
  const [apepat, setApepat] = React.useState('');
  const [apemat, setApemat] = React.useState('');
  const [matricula, setMatricula] = React.useState('');
  const [fechaNac, setFechaNacimiento] = React.useState('');
  const [telefono, setNumeroTelefono] = React.useState('');
  const [materiaViejaId, setMateriaViejaId] = React.useState('');

  const [materiaId, setMateriaId] = React.useState('');
  const [materias, setMaterias] = React.useState([]);

  const [rolId, setRolId] = React.useState('');
  const [roles, setRoles] = React.useState([]);

  const [ListaDocentes, setDocentes] = React.useState([]);
  const [mensaje, setMensaje] = React.useState('');

  React.useEffect(()=>{
    if (!auth.currentUser || usuario.rolId !== 'E2gFLIgUTOZyyXr1h3pb') {
      navegar('/');
    }else{
      obtenerDocentes();
      obtenerInfoTablas();
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

      //Verifico si la materia esta en uso
      const materia = await getDoc(doc(db, 'materias', materiaId));
      const infoMateria = materia.data();
      
      if (infoMateria.docenteId) {
        setMensaje('Esta materia ya fue asignada, seleccione una disponible');
        return;
      }

      //Para quitar el mensaje una vez se haya elegido una materia disponible
      if (mensaje) {
        setMensaje('')
      }

      if (editarRegistro) {
        actualizarDocente();
        return;
      }

      if (!nombre || !apepat || !apemat || !matricula || !telefono || !materiaId || !rolId) {
          setMensaje('Llene los campos requeridos');
          return;
      }
      
      const correo = matricula + '@gmail.com';
      const clave = '123456';

      try {
          await createUserWithEmailAndPassword(auth, correo, clave);

          await setDoc(doc(db, 'usuarios', matricula), {
              usuario: matricula,
              nombre: nombre,
              clave, clave,
              rolId: rolId
          });

          await setDoc(doc(db, 'docentes', matricula), {
              nombre: nombre,
              apepat: apepat,
              apemat: apemat,
              fechaNac: fechaNac,
              telefono: telefono,
              rolId: rolId
          });

          updateDoc(doc(db, 'materias', materiaId), {docenteId: matricula});

          setNombre('');
          setApepat('');
          setApemat('');
          setMatricula('');;
          setNumeroTelefono('');
          setRolId('');
          setMateriaId('');


      } catch (error) {
          console.log(error);
          return;
      }
      
  }

  const actualizarDocente = async() => {
    if (!nombre || !apepat || !apemat || !fechaNac || !matricula || !telefono || !materiaId || !rolId) {
      setMensaje('Llene los campos requeridos');
      return
    }

    //Vacio el docenteId de la meteria vieja
    if (materiaViejaId) {
      await updateDoc(doc(db, 'materias', materiaViejaId), {docenteId: ""});
    }

    //Despues le pongo el docenteId a la nueva materia
    await updateDoc(doc(db, 'materias', materiaId), {docenteId: matricula}); 

    await setDoc(doc(db, 'docentes', matricula), {
      nombre: nombre,
      apepat: apepat,
      apemat: apemat,
      fechaNac: fechaNac,
      rolId: rolId,
      telefono: telefono,
    });

    setNombre('');
    setApepat('');
    setApemat('');
    setFechaNacimiento('yyyy/MM/dd');
    setMatricula('');
    setRolId('');
    setMateriaId('');
    setNumeroTelefono('');

    setEditarRegistro(null);
  }

  const obtenerDocentes = async() => {
    onSnapshot(
      collection(db, 'docentes'),
      query => {
        const arrayDocentes = query.docs.map(item => ({id: item.id, ...item.data()}));
        
        obtenerDocentesCompletos(arrayDocentes);
      }
    )
  }

  const obtenerDocentesCompletos = async(arrayDocentes) => {
    for (let i = 0; i < arrayDocentes.length; i++) {
      const docId = arrayDocentes[i].id;

      const consulta = query(collection(db, 'materias'), where('docenteId', '==', docId));
      const materia = await getDocs(consulta);
      const arrayNomMateria = materia.docs.map(item => (item.data().nombre));
      const nomMateria = arrayNomMateria[0];

      if (nomMateria) {
        arrayDocentes[i].nombreMateria = nomMateria;
      }else{
        arrayDocentes[i].nombreMateria = '';
      }
    }

    setDocentes(arrayDocentes);
  }

  const obtenerInfoDocente = async(id) => {
    setEditarRegistro(true);

    //Le paso al hook para usarlo en actualizarDocente()
    setDocenteId(id);

    const docente = await getDoc(doc(db, 'docentes', id));
    const infoDocente = docente.data();

    setNombre(infoDocente.nombre);
    setApepat(infoDocente.apepat);
    setApemat(infoDocente.apemat);
    setMatricula(id);
    setFechaNacimiento(infoDocente.fechaNac);
    setNumeroTelefono(infoDocente.telefono);
    setRolId(infoDocente.rol_id);

    //Mando a traer su materia de la tabla materias
    const consulta2 = query(collection(db, 'materias'), where('docenteId', '==', id));
    const docenteMateria = await getDocs(consulta2);
    const arrayMateria = docenteMateria.docs.map(item => ({id: item.id, ...item.data()}));

    if (arrayMateria.length === 1) {
      setMateriaId(arrayMateria[0].id);
      setMateriaViejaId(arrayMateria[0].id); // Lo paso aqui para poder actualizar el docenteId
    }
  }

  return (
    <div className='row'>
        <div className="col-xl-8 border border-secondary">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope='col'>#</th>
                <th scope='col'>Nombre(s)</th>
                <th scope='col'>Apellido paterno</th>
                <th scope='col'>Materia</th>
                <th scope='col'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {
                ListaDocentes.map((item, index) =>
                <tr key={index}>
                  <th>{item.id}</th>
                  <td>{item.nombre}</td>
                  <td>{item.apepat}</td>
                  
                  {item.nombreMateria ? (<td>{item.nombreMateria}</td>) : (<td>Sin asignar</td>)}

                  <td>
                    <button className='btn btn-warning ms-3' onClick={e => obtenerInfoDocente(item.id)}>Editar</button>
                    <button className="btn btn-danger ms-3" /*onClick={e => borrarAlumno(item.id)}*/>Eliminar</button>  
                  </td>
                </tr>
                )
              }
            </tbody>
          </table>
        </div>
        <div className="col-xl-4 border border-secondary">
          <form className="card" onSubmit={agregarDocente}>
            {
              matDisponible === false && (
                <div className="alert alert-danger">Esta materia ya fue asignada, seleccione una disponible.</div>
              )
            }
            {
              editarRegistro === true ? (
                <h3 className='mt-3 mb-3 ms-3'>Editar docente</h3>
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
                <input type="number" className='form-control' placeholder='Matrícula' value={matricula} onChange={e => setMatricula(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <input type="date" className='form-control' value={fechaNac} onChange={e => setFechaNacimiento(e.target.value)} />
              </div>
              <div className="input-group mb-3">
                <input type="number" className='form-control' placeholder='teléfono' value={telefono} onChange={e => setNumeroTelefono(e.target.value)} />
              </div>
              <select className="form-select mt-3 mb-3" onChange={e => setMateriaId(e.target.value)}>
                <option value='1'>Materia</option>
                {
                  materias.map((item, index) => 
                    item.id === materiaId ? (<option value={item.id} key={index} selected>{item.nombre}</option>   
                    ) : (
                      <option value={item.id} key={index}>{item.nombre}</option>   
                    )
                  )              
                }

              </select>
              
              <select className="form-select mt-3 mb-3" onChange={e => setRolId(e.target.value)}>
                <option value='1' selected>Rol</option>
                {
                    roles.map((item, index) => 
                      item.id === rolId ? (
                        <option value={item.id} key={index} selected>{item.nombre}</option>
                      ) : (
                        <option value={item.id} key={index}>{item.nombre}</option>
                      )
                    )
                }
                
              </select>
            </div>

            <button className={editarRegistro ? ('btn btn-warning mb-3') : ('btn btn-dark mb-3')} type='submit'>Registrar docente</button>
          </form>
        </div>
    </div>
  )
}

export default Docentes