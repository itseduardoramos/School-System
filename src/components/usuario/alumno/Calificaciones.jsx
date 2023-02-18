import React from 'react'
import { useNavigate } from 'react-router-dom';
import { UsuarioContext } from '../../../context/UsuarioProvider';
import { auth, db } from '../../../firebase';
import { collection, getDoc, getDocs, doc, query, where } from 'firebase/firestore';


const Calificaciones = () => {
  const navegar = useNavigate();
  const {usuario} = React.useContext(UsuarioContext);

  const [listaMaterias, setListaMaterias] = React.useState([]);

    React.useEffect(()=>{
        //Si no hay usuario o no es alumno lo regreso 
        if (!auth.currentUser) {
          navegar('/login');
        }

        if (usuario.rolId !== 'oFf9o1Gyi7W2FYwgIjWw') {
            navegar('/bienvenida')
        }

        obtenerMaterias();
      },[usuario]);

    const obtenerMaterias = async() => {
      const Docentes = new Map();
      const docentes = await getDocs(collection(db, 'docentes'));
      const arrayDocentes = docentes.docs.map(item => ({id: item.id, ...item.data()}));
      for (let i = 0; i < arrayDocentes.length; i++) {
        Docentes.set(
          [
            arrayDocentes[i].id,
            arrayDocentes[i].nombre
          ]
        );
        
      }

      const alumnos = await getDoc(doc(db, 'alumnos', usuario.matricula));

      const infoAlumno = alumnos.data();
      console.log(infoAlumno);

      
      const semestreId = infoAlumno.semestreId;
      const carreraId = infoAlumno.carreraId;
      const alumnoId = usuario.matricula;

      console.log(semestreId);
      console.log(carreraId);
      console.log(alumnoId);

      const consulta = query(collection(db, 'materias'), where('semestreId', '==', semestreId), where('carreraId', '==', carreraId));
      const materias = await getDocs(consulta);

      const arrayMaterias = materias.docs.map(item => item.data());
      console.log(arrayMaterias);
      /*
      const materias = await getDocs(consulta2);
      const arrayMaterias = materias.docs.map(item => ({id: item.id, ...item.data()}));
      //setListaMaterias(arrayMaterias);

      obtenerCalificaciones(arrayMaterias, alumnoId);
      */
      
    }

    const obtenerCalificaciones = async(arrayMaterias, alumnoId) => {
      const Calificaciones = new Map();

      const consulta = query(collection(db, 'calificaciones'), where('alumnoId', '==', alumnoId));
      const calif = await getDocs(consulta);
      const arrayCalif = calif.docs.map(item => ({id: item.id, ...item.data()}));

      if (arrayCalif.length === 1) {
        Calificaciones.set(
          arrayCalif[0].materiaId,
          [
            arrayCalif[0].unidad1,
            arrayCalif[0].unidad2,
            arrayCalif[0].unidad3
          ]
        );
      }

      for (let i = 0; i < arrayMaterias.length; i++) {
        const valor = Calificaciones.get(arrayMaterias[i].id); //Lo traigo acorde al verificador
        if (valor) {
          const promedio = (valor[0] + valor[1] + valor[2]) / 3;
          arrayMaterias[i].unidad1 = valor[0];
          arrayMaterias[i].unidad2 = valor[1];
          arrayMaterias[i].unidad3 = valor[2];
          arrayMaterias[i].promedio = promedio
          
        }else{
          arrayMaterias[i].unidad1 = 'S/E';
          arrayMaterias[i].unidad2 = 'S/E';
          arrayMaterias[i].unidad3 = 'S/E';
        }
      }
      
      //console.log(arrayMaterias)
      setListaMaterias(arrayMaterias);
    }

  return (
    <div className='row'>
      <div className="col-7">
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope='col'>Materia</th>
              <th scope='col'>Unidad 1</th>
              <th scope='col'>Unidad 2</th>
              <th scope='col'>Unidad 3</th>
              <th scope='col'>promedio</th>
            </tr>
          </thead>
          <tbody>
            {
              listaMaterias.length >= 0 && (
                listaMaterias.map((item, index) =>
                  <tr key={index}>
                    <td>{item.nombre}</td>
                    <td>{item.unidad1}</td>
                    <td>{item.unidad2}</td>
                    <td>{item.unidad3}</td>

                    {
                          isNaN(item.unidad2) == true || isNaN(item.unidad2) == true || isNaN(item.unidad2) == true ? (
                            <td>Pendiente</td>
                          ) : (
                            <td>{item.promedio}</td>
                          )
                    }
                  </tr>
                )
              )
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Calificaciones