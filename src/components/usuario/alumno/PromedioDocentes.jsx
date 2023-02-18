import { collection, getDocs, query, where } from 'firebase/firestore';
import React from 'react';
import { UsuarioContext } from '../../../context/UsuarioProvider';
import { db } from '../../../firebase';

const PromedioDocentes = (props) => {
    const {usuario} = React.useContext(UsuarioContext);
    const [docentes, setDocentes] = React.useState([]);

    React.useEffect(()=>{
        obtenerCalifDocentes();
    },[]);

    const obtenerCalifDocentes = async() =>{
        const Calificaciones = new Map();
        const arrayDocentes = props.docentes;

        const consulta1 = query(collection(db, 'evaluacion_docentes_alumnos'), where('aluMatricula', '==', usuario.matricula))
        const califDocentes = await getDocs(consulta1);
        const arrayCalifDoc = califDocentes.docs.map(item => ({id: item.id, ...item.data()}));

        for (let i = 0; i < arrayCalifDoc.length; i++) {
            Calificaciones.set(
                arrayCalifDoc[i].docMatricula,
                [
                    arrayCalifDoc[i].calif1,
                    arrayCalifDoc[i].calif2,
                    arrayCalifDoc[i].calif3,
                    arrayCalifDoc[i].calif4,
                    arrayCalifDoc[i].calif5,
                    arrayCalifDoc[i].promedio
                ]
            );
        }

        for (let i = 0; i < arrayDocentes.length; i++) {
           const valor = Calificaciones.get(arrayDocentes[i].matricula);
           if (valor) {
            arrayDocentes[i].calif1 = valor[0];
            arrayDocentes[i].calif2 = valor[1];
            arrayDocentes[i].calif3 = valor[2];
            arrayDocentes[i].calif4 = valor[3];
            arrayDocentes[i].calif5 = valor[4];
            arrayDocentes[i].promedio = valor[5];

           }else{
            arrayDocentes[i].calif1 = 'S/E';
           }
        }

        const arrayDocentesNvo = arrayDocentes.filter(item => item.calif1 != 'S/E');

        //console.log(arrayDocentesNvo)
        setDocentes(arrayDocentesNvo);
}

  return (
    <div className='col-md-8'>
        <div className="card">
            <div className="card-body">
                <h5>Mi evaluación a docentes</h5>
                <table className="table">
                    <thead>
                        <tr>
                            <td></td>
                            <th colespan='5'>Preguntas</th>
                        </tr>
                        <tr>
                            <th scope='col'>Docente</th>  
                            <th scope='col'>1</th>
                            <th scope='col'>2</th>
                            <th scope='col'>3</th>
                            <th scope='col'>4</th>
                            <th scope='col'>5</th>
                            <th scope='col'>Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            docentes.length >= 0 && (
                                docentes.map((item, index) =>
                                    <tr key={index}>
                                        <td>{item.nombre}</td>
                                        <td>{item.calif1}</td>
                                        <td>{item.calif2}</td>
                                        <td>{item.calif3}</td>
                                        <td>{item.calif4}</td>
                                        <td>{item.calif5}</td>
                                        <th>{item.promedio}</th>
                                    </tr>
                                )
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}

export default PromedioDocentes