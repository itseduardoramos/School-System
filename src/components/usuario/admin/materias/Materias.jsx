import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UsuarioContext } from '../../../../context/UsuarioProvider';
import { db, auth } from '../../../../firebase';

const Materias = () => {
    const {usuario} = React.useContext(UsuarioContext);
    const navegar = useNavigate();

    const [editarRegistro, steEditarRegistro] = React.useState(false);

    const [carreras, setCarreras] = React.useState([]);
    const [carreraId, setCarreraId] = React.useState('');
    const [nombreCarrera, setNombreCarrera] = React.useState('');
    const [nombreSemestre, setNombreSemestre] = React.useState('');
    const [semestres, setSemestres] = React.useState([]);
    const [semestreId, setSemestreId] = React.useState('');
    const [materias, setMaterias] = React.useState([]);
    const [nombreMateria, setNombreMateria] = React.useState('');
    const [materiaId, setMateriaId] = React.useState(''); //Para usarlo en actualizarMateriaGrupo

    const [mensaje, setMensaje] = React.useState(null);
    const [listaMaterias, setListaMaterias] = React.useState([]);

    const [materiasId, setMateriasId] = React.useState([]);

    React.useEffect(()=>{
        //Si no hay usuario o no es administrador lo regreso 
        if (!auth.currentUser || usuario.rolId !== 'E2gFLIgUTOZyyXr1h3pb') {
            navegar('/');
        }else{
            obtenerInfoTablas();
            obtenerMaterias();
        }
    },[usuario]);

    const obtenerInfoTablas = async() => {
        const carreras = await getDocs(collection(db, 'carreras'));
        const arrayCarreras = carreras.docs.map(item => ({id: item.id, ...item.data()}));
        setCarreras(arrayCarreras);

        const q = query(collection(db, 'semestres'), orderBy('orden'));
        const semestres = await getDocs(q);
        const arraySemestres = semestres.docs.map(item => ({id: item.id, ...item.data()}));
        setSemestres(arraySemestres);

        const q2 = query(collection(db, 'materias'), where('semestreId', '==', ''));

        const materias = await getDocs(q2);
        const arrayMaterias = materias.docs.map(item => ({id: item.id, ...item.data()}));
        setMaterias(arrayMaterias);
    } 

    //Trae el listado pero sin el nombre del docente
    const obtenerMaterias = async() => {
        let docentesId = [];
        let carrerasId = [];
        let semestresId = [];
        onSnapshot(
            collection(db, 'materias'),
            query => {
                const arrayMaterias = query.docs.map(item => ({id: item.id, ...item.data()}));

                //Los almaceno en el array para usarlos en obtenerMateriasCompletas
                arrayMaterias.forEach(item => docentesId.push(item.docenteId));
                arrayMaterias.forEach(item => carrerasId.push(item.carreraId));
                arrayMaterias.forEach(item => semestresId.push(item.semestreId));

                obtenerMateriasCompletas(arrayMaterias, docentesId, carrerasId, semestresId);
            }
        )
    }

    const obtenerMateriasCompletas = async (arrayMaterias, docentesId, carrerasId, semestresId) => {
        for (let i = 0; i < docentesId.length; i++) {

            if (docentesId[i]) {
                const docente = await getDoc(doc(db, 'docentes', docentesId[i]));
                const nomDocente = docente.data().nombre; 
                const apepatDocente = docente.data().apepat;

                arrayMaterias[i].nombreDocente = nomDocente;
                arrayMaterias[i].apepatDocente = apepatDocente;

            }else{
                arrayMaterias[i].nombreDocente = '';
            }
        }

        for (let i = 0; i < carrerasId.length; i++) {
            const carrera = await getDoc(doc(db, 'carreras', carrerasId[i]));
            const nomCarrera = carrera.data().nombre;

            arrayMaterias[i].nombreCarrera = nomCarrera;
        }

        for (let i = 0; i < semestresId.length; i++) {
            const semestre = await getDoc(doc(db, 'semestres', semestresId[i]));
            const nomSemestre = semestre.data().nombre;

            arrayMaterias[i].nombreSemestre = nomSemestre;
            
        }

        setListaMaterias(arrayMaterias);
    }

    const obtenerInfoMateria = async(id, carId, semId) => {
        steEditarRegistro(true);

        try {
            //Le paso el id de la meteria para usarlo en actualizarMateriaGrupo
            setMateriaId(id);
            const materia = await getDoc(doc(db, 'materias', id));
            const infoMateria = materia.data();
            setNombreMateria(infoMateria.nombre);
            
            setCarreraId(infoMateria.carreraId);
            const carrera = await getDoc(doc(db, 'carreras', carId));
            const nomCarrera = carrera.data().nombre;
            setNombreCarrera(nomCarrera);

            //POR QUE USE LOS HOOKS CARRERAID Y SEMESTREID? xd

            setSemestreId(infoMateria.semestreId);
            const semestre = await getDoc(doc(db, 'semestres', semId));
            const nomSemestre = semestre.data().nombre;
            setNombreSemestre(nomSemestre);


        } catch (error) {
            console.log(error);
            return;
        }
    }

    const agregarGrupoMaterias = async(e) => {
        e.preventDefault();

        if (editarRegistro) {
            actualizarGrupoMaterias();
            return;
        }

        const q = query(collection(db, 'materias'), where('carreraId', '==', carreraId), where('semestreId', '==', semestreId));
        
        const materias = await getDocs(q);
        const arrayMaterias = materias.docs.map(item => ({id: item.id, ...item.data()}));
        
        //Si aun no tiene el limite de materias lo dejo agregarle mas
        if (arrayMaterias.length === 6) {
            setMensaje('Esta carrera ya tiene 6 materias');
            return;
        }

        //Actualizo el las materias elegidas y les agergo los campos carrera y semestre
        if (materiaId) {
            await updateDoc(doc(db, 'materias', materiaId), {carreraId: carreraId, semestreId: semestreId});
        }
    }

    const actualizarGrupoMaterias = async() => {
        try {
            await updateDoc(doc(db, 'materias', materiaId), {carreraId: carreraId, semestreId: semestreId});

        } catch (error) {
            console.log(error);
            return;
        }
    }

  return (
    <div className='row'>
        <div className="col-xl-8">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>Nombre</th>
                        <th scope='col'>Docente</th>
                        <th scope='col'>Carrera</th>
                        <th scope='col'>Semestre</th>
                        <th scope='col'>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        listaMaterias.length >= 1 && (
                            listaMaterias.map((item, index) =>
                                <tr key={index}>
                                    <th scope='row'></th>
                                    <td>{item.nombre}</td>
                                    
                                    {item.nombreDocente ? (<td>{item.nombreDocente} {item.apepatDocente}</td>) : (<td>Sin asignar</td>)}
                                    {item.nombreCarrera ? (<td>{item.nombreCarrera}</td>) : (<td>Sin asignar</td>)}
                                    {item.nombreSemestre ? (<td>{item.nombreSemestre}</td>) : (<td>Sin asignar</td>)}
                                    
                                
                                    <td>
                                        <button className="btn btn-warning" onClick={e => obtenerInfoMateria(item.id, item.carreraId, item.semestreId)}>Editar</button>
                                    </td>
                                </tr>
                            )
                        )
                    }
                </tbody>
            </table>
        </div>
        <div className="col-xl-4">
            <form className='card' onSubmit={agregarGrupoMaterias}>
                <div className="card-body">
                    {
                        mensaje && (
                            <div className="alert alert-danger">
                                {mensaje}
                            </div>
                        )
                    }
                    
                    {
                        editarRegistro ? (
                            <h5>Editar datos</h5>
                        ) : (
                            <h5>Seleccione carrera y semestre</h5>
                        )
                    }
                    <select className='form-select mt-3 mb-3' onChange={e => setCarreraId(e.target.value)}>
                        <option value="1">Carrera</option>
                        {
                           
                            carreras.length >= 1 && (
                                carreras.map((item, index) =>
                                    item.id !== carreraId && (
                                        <option value={item.id} key={index}>{item.nombre}</option>
                                    )
                                )
                            )
                        }

                        {editarRegistro && (<option value={carreraId} selected>{nombreCarrera}</option>)}
                    </select>
                    <select className="form-select mt-3 mb-3" onChange={e => setSemestreId(e.target.value)}>
                        <option defaultValue="1">Semestre</option>
                        {
                            semestres.length >= 1 && (
                                semestres.map((item, index) => 
                                    item.id !== semestreId && (
                                        <option value={item.id} key={index}>{item.nombre}</option>
                                    )
                                )
                            )
                        }

                        {/*Para no mostrar el id hago condicionales para poner el nombre del semestre acorde al id */}
                        {editarRegistro && (<option value={semestreId} selected>{nombreSemestre}</option>)}

                    </select>

                    {
                        editarRegistro ? (
                            <h5>Materia</h5>
                        ) : (
                            <h5>Elija materias</h5>
                        )
                    }
                    {
                        editarRegistro ? (
                            <div className="input-group mt-3 mb-3 w-100">
                                <input type="text" className='form-control' value={nombreMateria} disabled/>
                            </div>
                        ) : (
                            <select className="form-select mt-3 mb-3" onChange={e => setMateriaId(e.target.value)}>
                                <option defaultValue="1">Materia</option>
                                {
                                    materias.length >= 1 ? (
                                        materias.map((item, index) => 
                                            <option value={item.id} key={index}>{item.nombre}</option>
                                        )
                                    ) : (
                                        <option value="1">Todas las materias han sido asignadas</option>
                                    )
                                }
                            </select>
                        )
                    }
                </div>
                <button type='submit' className={editarRegistro ? ('btn btn-warning') : ('btn btn-dark')}>{editarRegistro ? (<p>Editar datos</p> ) : (<p>Registrar datos</p>)}</button>
            </form>
        </div>
    </div>
  )
}

export default Materias