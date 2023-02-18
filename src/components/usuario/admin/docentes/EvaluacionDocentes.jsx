import { collection, getDocs, query, where } from 'firebase/firestore'
import React from 'react'
import { db } from '../../../../firebase';

const EvaluacionDocentes = () => {
    const [docentes, setDocentes] = React.useState([]);
    const [infoDocente, setInfoDocente] = React.useState([]);

    React.useEffect(()=>{
        obtenerDocentes();
    },[]);

    const obtenerDocentes = async() =>{
        //SCAR EL PROMEDIO DE CALIF POR PREGUNTA
        const docentes = await getDocs(collection(db, 'docentes'));
        const arrayDocentes = docentes.docs.map(item => ({id: item.id, ...item.data()}));
        //CORREGIR LAS TABLAS Y PONER DOCENTEID EN VEZ DE MATRICULA

        for (let i = 0; i < arrayDocentes.length; i++) {
            const docenteId = arrayDocentes[i].id

            const consulta1 = query(collection(db, 'materias'), where('docenteId', '==', docenteId));
            const materia = await getDocs(consulta1);
            const arrayMateria = materia.docs.map(item => item.data());
            const nombreMat = arrayMateria[0].nombre;
            arrayDocentes[i].materia = nombreMat;
        
            const consulta2 = query(collection(db, 'evaluacion_docentes_alumnos'), where('docenteId', '==', docenteId));
            const evDocentes = await getDocs(consulta2);
            const arrayEvDocentes = evDocentes.docs.map(item => ({id: item.id, ...item.data()}));

            if (arrayEvDocentes.length >= 0) {
                let promedio = 0;
                let promedioFinal = 0;

                //Saco el promedio final
                if (arrayEvDocentes.length == 1) {
                    arrayDocentes[i].promedio = arrayEvDocentes[0].promedio;
                }else{
                    for (let j = 0; j < arrayEvDocentes.length; j++) {
                        if (j == 0) {
                            promedio = arrayEvDocentes[j].promedio;
                        }else{
                            promedioFinal = promedio + arrayEvDocentes[j].promedio;
                        }
    
                        promedioFinal/=arrayEvDocentes.length;
    
                        arrayDocentes[i].promedio = promedioFinal;
                    }
                }
            }
        }

        const arrayDocentesNvo = arrayDocentes.filter(item => item.promedio >= 0);
        console.log(arrayDocentesNvo);
        setDocentes(arrayDocentesNvo)
    }

    const obtenerDetalles = async(id, promedio) =>{
        const consulta = query(collection(db, 'docentes'), where('matricula', '==', id));
        const docente = await getDocs(consulta);
        const arrayDocente = docente.docs.map(item => item.data());

        const consulta2 = query(collection(db, 'evaluacion_docentes_alumnos'), where('docMatricula', '==', id));
        const evDocente = await getDocs(consulta2);
        const arrayEvDocente = evDocente.docs.map(item => item.data());
        const calificaciones = arrayEvDocente.length;

        const info = {
                        matricula: arrayDocente[0].matricula,
                        nombre: arrayDocente[0].nombre,
                        apepat: arrayDocente[0].apepat,
                        apemat: arrayDocente[0].apemat,
                        calificaciones: calificaciones,
                        promedio: promedio
                    };
        setInfoDocente(info);
    }

  return (
    <div className="row">
        <div className="col-md-8">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>Nombre(s)</th>
                        <th scope='col'>Apellidos</th>
                        <th scope='col'>Materia</th>
                        <th scope='col'>Promedio</th>
                        <th scope='col'>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        docentes.length >= 1 ? (
                            docentes.map((item, index) =>
                                <tr key={index}>
                                    <th>{item.matricula}</th>
                                    <td>{item.nombre}</td>
                                    <td>{item.apepat} {item.apemat}</td>
                                    <td>{item.materia}</td>
                                    <td>{item.promedio}</td>
                                    <td><button className='btn btn-success' onClick={e => obtenerDetalles(item.matricula, item.promedio)}>Detalles</button></td>
                                </tr>
                            )
                        ) : (
                            <th>
                                Aun no hay registros
                            </th>
                        )
                    }
                </tbody>
            </table>
        </div>
        <div className="col-md-4">
        {
            infoDocente.matricula  && (
                <div className='card'>
                    <div className="card-header">
                        <h5>Detalles de la evaluacion</h5>
                    </div>
                    <div className="card-body">
                        <table className='table'>
                            <tbody>
                                <tr>
                                    <th>Matricula: </th>
                                    <td>{infoDocente.matricula}</td>
                                </tr>
                                <tr>
                                    <th>Nombre: </th>
                                    <td>{infoDocente.nombre}</td>
                                </tr>
                                <tr>
                                    <th>Apellidos: </th>
                                    <td>{infoDocente.apepat} {infoDocente.apemat}</td>
                                </tr>
                                <tr>
                                    <th>Cantidad de votaciones: </th>
                                    <td>{infoDocente.calificaciones}</td>
                                </tr>

                                <tr>
                                    <th>Promedio</th>
                                    <td>{infoDocente.promedio}</td>
                                </tr>
                                <tr>
                                    {
                                        infoDocente.promedio >= 8 && (<div className="alert alert-success">Aprobado</div>)
                                    }
                                    {
                                        infoDocente.promedio <= 8 && (<div className="alert alert-danger">Reprobado: Se recomienda cambiar de maestro</div>)
                                    }
                                </tr>
                            </tbody>
                        </table>
                        
                    </div>
                </div>        
            )
        }
        </div>
    </div>
  )
}

export default EvaluacionDocentes