import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, getDocs, getDoc, doc, orderBy, query, onSnapshot, setDoc } from 'firebase/firestore';
import React from 'react';
import { auth, db } from '../../../../firebase';
import { useNavigate } from 'react-router-dom'
import { UsuarioContext } from '../../../../context/UsuarioProvider';

const Alumnos = () => {
  const [alumnoId, setAlumnoId] = React.useState('');
  const [nombre, setNombre] = React.useState('');
  const [apepat, setApepat] = React.useState('');
  const [apemat, setApemat] = React.useState('');
  const [matricula, setMatricula] = React.useState('');
  const [fechaNac, setFechaNacimiento] = React.useState();
  const [numeroTelefono, setNumeroTelefono] = React.useState();

  const [carreraId, setCarreraId] = React.useState('');
  const [semestreId, setSemestreId] = React.useState('');
  const [grupoId, setGrupoId] = React.useState('');
  const [rolId, setRolId] = React.useState('');

  const [mensaje, setMensaje] = React.useState(null);
  const [carreras, setCarreras] = React.useState([]);
  const [semestres, setSemestres] = React.useState([]);
  const [grupos, setGrupos] = React.useState([]);
  const [roles, setRoles] = React.useState([]);

  const [listaAlumnos, setListaAlumnos] = React.useState([]);
  const [editarRegistro, setEditarRegistro] = React.useState(false);
  //un programa el cual permita medir el rendimiento de un empleado

  const navegar = useNavigate();
  const {usuario} = React.useContext(UsuarioContext);

  React.useEffect(()=>{
    //Si no hay usuario o no es administrador lo regreso 
    if (!auth.currentUser || usuario.rolId !== 'E2gFLIgUTOZyyXr1h3pb') {
      navegar('/bienvenida');
    }else{
      obtenerAlumnos();
      obtenerInfoTablas();
    }
  },[usuario]);

  const obtenerInfoTablas = async() => {
    const carreras = await getDocs(collection(db, 'carreras'));
    const arrayCarreras = carreras.docs.map(item => ({id: item.id, ...item.data()}));
    setCarreras(arrayCarreras);

    const semestres = await getDocs(query(collection(db, 'semestres'), orderBy('orden')));
    const arraySemestres = semestres.docs.map(item => ({id: item.id, ...item.data()}));
    setSemestres(arraySemestres);

    const grupos = await getDocs(query(collection(db, 'grupos'), orderBy('nombre')));
    const arrayGrupos = grupos.docs.map(item => ({id: item.id, ...item.data()}));
    setGrupos(arrayGrupos);

    const roles = await getDocs(collection(db, 'roles'));
    const arrayRoles = roles.docs.map(item => ({id: item.id, ...item.data()}));
    setRoles(arrayRoles);


  }

  const agregarAlumno = async(e) => {
    e.preventDefault();

    if (editarRegistro) {
      actualizarAlumno();
      return
    }

    if (!nombre || !apepat || !apemat || !matricula || !fechaNac || !numeroTelefono || !carreraId || !semestreId || !rolId || !grupoId) {
      setMensaje('Llene todo los compos requeridos');
      return;
    }

    //Creo el usuario para que pueda ingresar
    const correo = matricula + '@gmail.com';
    const clave = '123456';
    
    try{
      await createUserWithEmailAndPassword(auth, correo, clave);

      await setDoc(doc(db, 'usuarios', matricula), {
        usuario: matricula,
        nombre: nombre,
        clave: clave,
        rolId: rolId
      });
      
      await setDoc(doc(db, 'alumnos', matricula), {
        nombre: nombre,
        apepat: apepat,
        apemat: apemat,
        fechaNac: fechaNac,
        telefono: numeroTelefono,
        carreraId: carreraId,
        semestreId: semestreId,
        rolId: rolId,
        grupoId: grupoId

      });

    }catch{
      return;
    }

    //Despues de darlo de alta creo su usuario y contraseña para logearse

    setNombre('');
    setApepat('');
    setApemat('');
    setMatricula('');;
    setNumeroTelefono('');
    setFechaNacimiento('');
    setCarreraId('');
    setSemestreId('');
    setGrupoId('');
    setRolId('');
  }

  const actualizarAlumno = async() => {
    if (!nombre || !apepat || !apemat || !matricula || !fechaNac || !numeroTelefono || !carreraId || !semestreId || !rolId || !grupoId) {
      setMensaje('Llene todo los compos requeridos');
      return;
    }

    await setDoc(doc(db, 'alumnos', alumnoId), {
      nombre: nombre,
      apepat: apepat,
      apemat: apemat,
      matricula: matricula,
      fechaNac: fechaNac,
      telefono: numeroTelefono,
      carreraId: carreraId,
      semestreId: semestreId,
      rolId: rolId,
      grupoId: grupoId
    });

    setNombre('');
    setApepat('');
    setApemat('');
    setMatricula('');;
    setNumeroTelefono('');
    setFechaNacimiento('');
    setCarreraId('');
    setSemestreId('');
    setGrupoId('');
    setRolId('');

    setEditarRegistro(false);
  }

  const obtenerInfoAlumno = async(id) => {
    //Lo paso al hook para usarlo en actualizarAlumno
    setAlumnoId(id);

    const alumno = await getDoc(doc(db, 'alumnos', id));
    const infoAlumno = alumno.data();

    setNombre(infoAlumno.nombre);
    setApepat(infoAlumno.apepat);
    setApemat(infoAlumno.apemat);
    setMatricula(infoAlumno.matricula);
    setFechaNacimiento(infoAlumno.fechaNac);
    setNumeroTelefono(infoAlumno.telefono);
    setCarreraId(infoAlumno.carreraId);
    setSemestreId(infoAlumno.semestreId);
    setGrupoId(infoAlumno.grupoId);
    setRolId(infoAlumno.rolId);

    setEditarRegistro(true);
  }

  const borrarAlumno = async(id) => {
    console.log(id)
  }

  const obtenerAlumnos = async() => {
    onSnapshot(
      collection(db, 'alumnos'),
      query => {
        const arrayAlumnos = query.docs.map(item => ({id: item.id, ...item.data()}));
        console.log(arrayAlumnos)

        obtenerAlumnosCompletos(arrayAlumnos);
      }
    )
  }

  const obtenerAlumnosCompletos = async(arrayAlumnos) =>{
    //Mando a traer sus carreras, semestres y grupos
    for (let i = 0; i < arrayAlumnos.length; i++) {
      const carreraId = arrayAlumnos[i].carreraId;
      const carrera = await getDoc(doc(db, 'carreras', carreraId));
      const infoCarrera = carrera.data();
      arrayAlumnos[i].carrera = infoCarrera.nombre;

      const semestreId = arrayAlumnos[i].semestreId;
      const semestre = await getDoc(doc(db, 'semestres', semestreId));
      const infoSemestre = semestre.data();
      arrayAlumnos[i].semestre = infoSemestre.nombre;

      const grupoId = arrayAlumnos[i].grupoId;
      const grupo = await getDoc(doc(db, 'grupos', grupoId));
      const infoGrupo = grupo.data();
      arrayAlumnos[i].grupo = infoGrupo.nombre;
    }
    
    setListaAlumnos(arrayAlumnos);
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
              <th scope='col'>Carrera</th>
              <th scope='col'>Semestre</th>
              <th scope='col'>Grupo</th>
              <th scope='col'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {
              listaAlumnos.map((item, index) => 
                <tr key={index}>
                  <th scope='row'>{item.id}</th>
                  <td>{item.nombre}</td>
                  <td>{item.apepat}</td>
                  <td>{item.carrera}</td>
                  <td>{item.semestre}</td>
                  <td>{item.grupo}</td>
                  <td>
                    <button className='btn btn-warning ms-3' onClick={e => obtenerInfoAlumno(item.id)}>Editar</button>
                    <button className="btn btn-danger ms-3" onClick={e => borrarAlumno(item.id)}>Eliminar</button>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
        <button className='btn btn-success float-start'>Anterior</button>
        <button className='btn btn-success float-end'>Siguiente</button>
      </div>
      <div className="col-xl-4  border border-secondary">
      <form className="card" onSubmit={agregarAlumno}>
        {
          editarRegistro === true ? (
            <h3 className='mt-3 mb-3 ms-3'>Editar alumno</h3>
          ) : (
            <h3 className='mt-3 mb-3 ms-3'>Alta alumno</h3>
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
              <input type="number" className='form-control' placeholder='teléfono' value={numeroTelefono} onChange={e => setNumeroTelefono(e.target.value)} />
            </div>

            <select className="form-select mt-3 mb-3" onChange={e => setCarreraId(e.target.value)} >
            <option value='1'>Carrera</option>
              {
                carreras.map((item, index) => 
                  item.id === carreraId ? (
                    <option value={item.id} key={index} selected>{item.nombre}</option>
                  ) : (
                    <option value={item.id} key={index}>{item.nombre}</option>
                  )
                )
              }
            </select>

            <select className="form-select mt-3 mb-3" onChange={e => setSemestreId(e.target.value)} >
              <option value='1'>Semestre</option>
              {
                semestres.map((item, index) =>
                  item.id === semestreId ? (
                    <option value={item.id} key={index} selected>{item.nombre}</option>
                  ) : (
                    <option value={item.id} key={index}>{item.nombre}</option>
                  )
                )
              }
            </select>

            <select className="form-select mt-3 mb-3" onChange={e => setGrupoId(e.target.value)} >
              <option value='1'>Grupo</option>
              {
                grupos.map((item, index) => 
                  item.id === grupoId ? (
                    <option value={item.id} key={index} selected>{item.nombre}</option>
                  ) : (
                    <option value={item.id} key={index}>{item.nombre}</option>
                  )
                )
              }
            </select>

            <select className="form-select mt-3 mb-3" onChange={e => setRolId(e.target.value)} >
              <option value='1'>Rol</option>
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
          <button className={editarRegistro ? ('btn btn-warning mb-3') : ('btn btn-dark mb-3')} type="submit">
            {
              editarRegistro ? (
                <p className='text-dark'>Editar alumno</p>
              ) : (
                <p className='text-light'>Registrar alumno</p>
              )
            }
          </button>
        </form>
      </div>
    </div>
  )
}

export default Alumnos