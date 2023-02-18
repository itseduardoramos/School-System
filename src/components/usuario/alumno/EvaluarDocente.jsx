import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UsuarioContext } from '../../../context/UsuarioProvider';
import { db, auth } from '../../../firebase';
import PromedioDocentes from './PromedioDocentes';

const EvaluarDocente = () => {
  const {usuario} = React.useContext(UsuarioContext);
  const navegar = useNavigate();

  const [docentes, setDocentes] = React.useState([]);
  const [docMatricula, setDocMatricula] = React.useState('');
  const [calif1, setCalif1] = React.useState('');
  const [calif2, setCalif2] = React.useState('');
  const [calif3, setCalif3] = React.useState('');
  const [calif4, setCalif4] = React.useState('');
  const [calif5, setCalif5] = React.useState('');
  const [mensaje, setMensaje] = React.useState('');

  React.useEffect(()=>{
    if (!auth.currentUser || usuario.rol_id !== 'oFf9o1Gyi7W2FYwgIjWw') {
      navegar('/bienvenida');
    }else{
      obtenerDocentes();
    }
  },[usuario]);

  const obtenerDocentes = async() =>{
    const docentes = await getDocs(collection(db, 'docentes'));
    const arrayDocentes = docentes.docs.map(item => ({id: item.id, ...item.data()}));

    setDocentes(arrayDocentes);
  }

  const mandarCalificacion = async(e) =>{
    e.preventDefault();

    if (!docMatricula || !calif1 || !calif2 || !calif3 || !calif4 || !calif5) {
      setMensaje('Llene todos los campos');
      return;
    }

    if ((calif1 > 10 || calif1 < 0 ) || (calif2 > 10 || calif2 < 0) || (calif3 > 10 || calif3 < 0) || (calif4 > 10 || calif4 < 0) || (calif5 > 10 || calif5 < 0)) {
      setMensaje('Agregue valores entre 0 y 10');
      return;
    }

    const consulta1 = query(collection(db, 'evaluacion_docentes_alumnos'), where('aluMatricula', '==', usuario.matricula), where('docMatricula', '==', docMatricula))
    const calif = await getDocs(consulta1);
    const infoCalif = calif.docs.map(item => ({id: item.id, ...item.data()}));

    if (infoCalif.length === 0) {
      const c1 = parseInt(calif1);
      const c2 = parseInt(calif2);
      const c3 = parseInt(calif3);
      const c4 = parseInt(calif4);
      const c5 = parseInt(calif5);
      const promedio = (c1 + c2 + c3 + c4 + c5) / 5;
      
      await addDoc(collection(db, 'evaluacion_docentes_alumnos'),{
        aluMatricula: usuario.matricula,
        calif1: c1,
        calif2: c2,
        calif3: c3,
        calif4: c4,
        calif5: c5,
        promedio: promedio,
        docMatricula: docMatricula

      }).then(() => {
        setCalif1('');
        setCalif2('');
        setCalif3('');
        setCalif4('');
        setCalif5('');
        setDocMatricula('');
        setMensaje('Información guardada con éxito');

      }).catch(()=>{
        setMensaje('Problemas en el servidor, contacte al administrador')
      })
    }else{
      setMensaje('Ya se calificó a este docente');
    }

    
  }

  return (
    <div className='row'>
        <div className='col-md-4'>
            <form className='card' onSubmit={mandarCalificacion}>
              <div className='card-body'>
                  <h5>Evaluación a docentes</h5>
                  <h5>Clifique únicamente del 1 al 10</h5>

                  {mensaje === 'Llene todos los campos' && (<div className="alert alert-danger">{mensaje}</div>)}
                  {mensaje === 'Ya se calificó a este docente' && (<div className='alert alert-danger'>{mensaje}</div>)}
                  {mensaje === 'Problemas en el servidor, contacte al administrador' && (<div className='alert alert-success'>{mensaje}</div>)}
                  {mensaje === 'Agregue valores entre 0 y 10' && (<div className='alert alert-danger'>{mensaje}</div>)}
                  {mensaje === 'Información guardada con éxito' && (<div className="alert alert-success">{mensaje}</div>)}
                  
                  <select className='form-select mt-3 mb-3' onChange={e => setDocMatricula(e.target.value)}>
                    <option value="">Seleccione docente a evaluar</option>
                    {
                      docentes.length >= 1 && (
                        docentes.map((item, index) => 
                          <option value={item.matricula} key={index}>{item.nombre} {item.apepat} {item.apemat}</option>
                        )
                      )
                    }
                    
                  </select>

                  <p>1. El docente explicó con claridad el temario y cómo se iba a calificar</p>
                  <div className="input-group mb-3">
                    <input type="number" className="form-control" value={calif1} onChange={e => setCalif1(e.target.value)} />
                  </div>

                  <p>2. El docente repasa la clase anterior para reforzar los conocimientos</p>
                  <div className="input-group mb-3">
                    <input type="number" className="form-control" value={calif2} onChange={e => setCalif2(e.target.value)} />
                  </div>

                  <p>3. El docente explica a los alumnos los temas que se les dificulten</p>
                  <div className="input-group mb-3">
                    <input type="number" className="form-control" value={calif3} onChange={e => setCalif3(e.target.value)} />
                  </div>

                  <p>4. El docente es experto en la materia</p>
                  <div className="input-group mb-3">
                    <input type="number" className="form-control" value={calif4} onChange={e => setCalif4(e.target.value)} />
                  </div>

                  <p>5. El docente se detiene a explicar a los alumnos a los que se les dificulta la materia</p>
                  <div className="input-group mb-3">
                    <input type="number" className="form-control" value={calif5} onChange={e => setCalif5(e.target.value)} />
                  </div>
                </div>
                <button className='btn btn-dark' type='submit'>Enviar</button>
            </form>
        </div>
        <PromedioDocentes docentes={docentes}/>
    </div>
  )
}

export default EvaluarDocente