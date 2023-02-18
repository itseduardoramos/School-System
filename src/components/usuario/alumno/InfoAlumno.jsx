import React from 'react'
import { auth, db } from '../../../firebase';
import { collection, getDoc, getDocs, doc, query, where, addDoc } from 'firebase/firestore';
import { UsuarioContext } from '../../../context/UsuarioProvider';
import { useNavigate } from 'react-router-dom';

const InfoAlumno = () => {
  const navegar = useNavigate();
  const {usuario} = React.useContext(UsuarioContext);
  const [infoAlumno, setInfoAlumno] = React.useState();
  const [reporte, setReporte] = React.useState('');

  React.useEffect(()=>{
    //Si no hay usuario o no es alumno lo regreso 
    if (!auth.currentUser || usuario.rol_id !== 'oFf9o1Gyi7W2FYwgIjWw') {
      navegar('/bienvenida');
    }else{
      obtenerInfoAlumno();
    }
  },[usuario]);

  const obtenerInfoAlumno = async() =>{
    const consulta = query(collection(db, 'alumnos'), where('matricula', '==', usuario.matricula));
    const alumno = await getDocs(consulta);
    const arrayAlumno = alumno.docs.map(item => ({id: item.id, ...item.data()}));

    const objAlumno = {
      apemat: arrayAlumno[0].apemat,
      apepat: arrayAlumno[0].apepat,
      carreraId: arrayAlumno[0].carreraId,
      fechaNac: arrayAlumno[0].fechaNac,
      grupoId: arrayAlumno[0].grupoId,
      matricula: arrayAlumno[0].matricula,
      nombre: arrayAlumno[0].nombre,
      rolId: arrayAlumno[0].rolId,
      semestreId: arrayAlumno[0].semestreId,
      telefono: arrayAlumno[0].telefono
    }

    const carreraId = objAlumno.carreraId;
    const carrera = await getDoc(doc(db, 'carreras', carreraId));
    const infoCarrera = carrera.data();
    objAlumno.carrera = infoCarrera.nombre;

    const grupoId = objAlumno.grupoId;
    const grupo = await getDoc(doc(db, 'grupos', grupoId));
    const infoGrupo = grupo.data();
    objAlumno.grupo = infoGrupo.nombre;

    const semestreId = objAlumno.semestreId;
    const semestre = await getDoc(doc(db, 'semestres', semestreId));
    const infoSemestre = semestre.data();
    objAlumno.semestre = infoSemestre.nombre;

    const rolId = objAlumno.rolId;
    const rol = await getDoc(doc(db, 'roles', rolId));
    const infoRol = rol.data();
    objAlumno.rol = infoRol.nombre;

    setInfoAlumno(objAlumno);
  }

  const mandarReporte = async(e) =>{
    e.preventDefault();

    //console.log(infoAlumno.matricula); return

    await addDoc(collection(db, 'reportes'), {
      matricula: infoAlumno.matricula,
      reporte: reporte
    });//then
    console.log("registro hecho");
  }

  return (
    <div className='row'>
      <div className="col-md-8">
      {
        infoAlumno && (
          <form className='card'>
          <div className="card-header">
          </div>
          <div className="card-body">
            <table className="table">
            <tbody>
                <tr>
                  <th scope='row'>Matricula</th>
                  <td>
                    <div className="input-group mb-3">
                      <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.matricula} disabled/>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope='row'>Nombre</th>
                  <td>
                    <div className="input-group mb-3">
                      <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.nombre} disabled/>
                      <input type="text" className='form-control' placeholder='apepat' value={infoAlumno.apepat} disabled/>
                      <input type="text" className='form-control' placeholder='apemat' value={infoAlumno.apemat} disabled/>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope='row'>Fecha de nacimiento</th>
                  <td>
                    <div className="input-group mb-3">
                      <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.fechaNac} disabled/>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope='row'>Carrera</th>
                  <td>
                    <div className="input-group mb-3">
                      <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.carrera} disabled/>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope='row'>Grupo</th>
                  <td>
                    <div className="input-group mb-3">
                    <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.grupo} disabled/>
                  </div>
                  </td>
                </tr>
                <tr>
                  <th scope='row'>Semestre</th>
                  <td>
                    <div className="input-group mb-3">
                      <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.semestre} disabled/>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope='row'>Rol</th>
                  <td>
                    <div className="input-group mb-3">
                      <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.rol} disabled/>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope='row'>Telefono</th>
                  <td>
                    <div className="input-group mb-3">
                      <input type="text" className='form-control' placeholder='nombre' value={infoAlumno.telefono} disabled/>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
        )
      }
      </div>
      <div className="col-md-4">
        <div className='card'>
          <div className="card-header"></div>
          <div className="card-body">
            <p>Si alguno de sus datos son incorrectos, mande un comentario especificando cuál para ser corregido</p>
            <form className='card' onSubmit={mandarReporte}>
              <input type="text" className='form-control' value={reporte} onChange={e => setReporte(e.target.value)} />
            </form>
          </div>
          <button type="submit" className='btn btn-dark'>Enviar</button>
        </div>
      </div>
    </div>
  )
}

export default InfoAlumno