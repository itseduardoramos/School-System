import { getDocs, query, collection, where, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { UsuarioContext } from '../../../context/UsuarioProvider';
import { db, auth } from '../../../firebase';

const CalificarAlumnos = () => {
  const {usuario} = React.useContext(UsuarioContext);
  const navegar = useNavigate();

  const [alumnos, setAlumnos] = React.useState([]);
  const [docenteId, setDocenteId] = React.useState('');
  const [materiaId, setMateriaId]= React.useState('');

  const [alumnoId, setAlumnoId] = React.useState('');
  const [alumnoNom, setAlumnoNom] = React.useState('');
  const [alumnoAP, setAlumnoAP] = React.useState('');
  const [alumnoAM, setAlumnoAM] = React.useState('')

  const [calificacionId, setCalificacionId] = React.useState('');
  const [califU1, setCalifU1] = React.useState();
  const [califU2, setCalifU2] = React.useState();
  const [califU3, setCalifU3] = React.useState();

  React.useEffect(()=>{
    if (!auth.currentUser) {
      navegar('/');
    }else{
      obtenerInfo();
    }
  },[]);

  const obtenerInfo = async() => {
    const consulta = query(collection(db, 'docentes'), where('matricula', '==', usuario.matricula));
    const docente = await getDocs(consulta);
    const arrayDocente = docente.docs.map(item => ({id: item.id, ...item.data()}));
    setDocenteId(arrayDocente[0].id);
    
    const consulta2 = query(collection(db, 'materias'), where('docenteId', '==', docenteId));
    const info = await getDocs(consulta2);
    const arrayInfo = info.docs.map(item => ({id: item.id, ...item.data()}));
    setMateriaId(arrayInfo[0].id);

    const semestreId = arrayInfo[0].semestreId;
    const carreraId = arrayInfo[0].carreraId;

    console.log(semestreId);
    console.log(carreraId);
    const consulta3 = query(collection(db, 'alumnos'), where('semestreId', '==', semestreId), where('carreraId', '==', carreraId));
    const alumnos = await getDocs(consulta3);
    const arrayAlumnos = alumnos.docs.map(item => ({id: item.id, ...item.data()}));

    console.log(arrayAlumnos);
    obtenerCalificaciones(arrayAlumnos);

  }

  const obtenerCalificaciones = async(arrayAlumnos) =>{
    const Calificaciones = new Map();

    for (let i = 0; i < arrayAlumnos.length; i++) {
      const aluId = arrayAlumnos[i].id;

      const consulta = query(collection(db, 'calificaciones'), where('materiaId', '==', materiaId), where('alumnoId', '==', aluId));
      const calif = await getDocs(consulta);
      const arrayCalif = calif.docs.map(item => ({id: item.id, ...item.data()}));

      if (arrayCalif.length === 1) {
        Calificaciones.set(
          arrayCalif[0].alumnoId, //Identificador
          [
            arrayCalif[0].unidad1,
            arrayCalif[0].unidad2,
            arrayCalif[0].unidad3
          ]
        );
      }
    }

    for (let i = 0; i < arrayAlumnos.length; i++) {
      const valor = Calificaciones.get(arrayAlumnos[i].id); //Lo traigo acorde al identificador
      if (valor) {
        arrayAlumnos[i].unidad1 = valor[0];
        arrayAlumnos[i].unidad2 = valor[1];
        arrayAlumnos[i].unidad3 = valor[2];
      }
    }
    
    console.log(arrayAlumnos)
    setAlumnos(arrayAlumnos);
  }

  const calificarAlumno = async(e) =>{
    e.preventDefault();

    const calif1 = parseFloat(califU1)
    const calif2 = parseFloat(califU2)
    const calif3 = parseFloat(califU3)

    try {
      //Si se cumple es porque aun no esta calificado en la tabla calificaciones
      if (!calificacionId) {
        await addDoc(collection(db, 'calificaciones'), {
          alumnoId: alumnoId,
          docenteId: docenteId,
          materiaId: materiaId,
          unidad1: calif1,
          unidad2: calif2,
          unidad3: calif3
        });

      }else{
        updateDoc(doc(db, 'calificaciones', calificacionId), {unidad1: calif1, unidad2: calif2, unidad3: calif3});
      }
    } catch (error) {
      console.log(error);
    }

    setAlumnoNom('');
    setAlumnoAP('');
    setAlumnoAM('');
    setCalifU1(0);
    setCalifU2(0);
    setCalifU3(0);
  }

  const obtenerInfoAlumno = async(alumnoId) => {
    setCalificacionId('');

    //Para usarlo en calificarAlumno()
    setAlumnoId(alumnoId);

    const alumno = await getDoc(doc(db, 'alumnos', alumnoId));
    const infoAlumno = alumno.data();

    setAlumnoNom(infoAlumno.nombre);
    setAlumnoAP(infoAlumno.apepat);
    setAlumnoAM(infoAlumno.apemat);

    const consulta = query(collection(db, 'calificaciones'), 
                          where('alumnoId', '==', alumnoId),
                          where('docenteId', '==', docenteId),
                          where('materiaId', '==', materiaId)
                      );

    const calificacion = await getDocs(consulta);
    const arrayCalif = calificacion.docs.map(item => ({id: item.id, ...item.data()}));
    
    //Si no trae respuesta es porque aun no lo califica
    if (arrayCalif.length >= 1) {
      setCalificacionId(arrayCalif[0].id);
      setCalifU1(arrayCalif[0].unidad1);
      setCalifU2(arrayCalif[0].unidad2);
      setCalifU3(arrayCalif[0].unidad3);
    }else{
      setCalifU1(0);
      setCalifU2(0);
      setCalifU3(0);
    }

  }

  return (
    <div className='row'>
      <div className="col-xl-8">
        <table className='table table-striped'>
          <thead>
            <tr>
              <th scope='col'>#</th>
              <th scope='col'>Nombre(s)</th>
              <th scope='col'>Apellidos</th>
              <th scope='col'>Unidad 1</th>
              <th scope='col'>Unidad 2</th>
              <th scope='col'>Unidad 3</th>
              <th scope='col'>Promedio</th>
              <th scope='col'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {
              alumnos.map((item, index) =>
                <tr key={index}>
                  <td>{item.matricula}</td>
                  <td>{item.nombre}</td>
                  <td>{item.apepat} {item.apemat}</td>
                  <td>{item.unidad1}</td>
                  <td>{item.unidad2}</td>
                  <td>{item.unidad3}</td>
                  <th>SE</th>
                  <th>
                    <button className='btn btn-warning' onClick={e => obtenerInfoAlumno(item.id)}>Calificar</button>
                  </th>
                </tr>  
              )
            }
          </tbody>
        </table>
      </div>
      <div className="col-xl-4">
        <form className='card' onSubmit={calificarAlumno}>
          <h3 className='mt-3 ms-3 mb-3'>Calificar alumno</h3>

          <div className="card-body">
            <div className="input-group mb-3">
            <input type="text" className="form-control" placeholder='Nombre(s)' value={alumnoNom} disabled/>
            <input type="text" className="form-control" placeholder='Apellido Paterno' value={alumnoAP} disabled />
            <input type="text" className="form-control" placeholder='Apellido Materno' value={alumnoAM} disabled />
            </div>

            <div className="input-group mb-3">
              <p className='me-3'>Unidad 1</p>
              <input type="number" className='form-control' placeholder='Unidad 1' value={califU1} onChange={e => setCalifU1(e.target.value)} />
            </div>
            <div className="input-group mb-3">
              <p className='me-3'>Unidad 2</p>
              <input type="number" className='form-control' placeholder='Unidad 2' value={califU2} onChange={e => setCalifU2(e.target.value)}/>
            </div>
            <div className="input-group mb-3">
              <p className='me-3'>Unidad 3</p>
              <input type="number" className='form-control' placeholder='Unidad 3' value={califU3} onChange={e => setCalifU3(e.target.value)}/>
            </div>
          </div>
          <button type='submit' className='btn btn-dark'>
              Calificar
          </button>
        </form>
      </div>
    </div>
  )
}

export default CalificarAlumnos