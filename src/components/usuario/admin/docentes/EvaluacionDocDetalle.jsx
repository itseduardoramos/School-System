import React from 'react'

const EvaluacionDocDetalle = ({obtenerDetalles}) => {
  const [docente, setDocente] = React.useState([]);
  React.useEffect(()=>{
    obtenerDetalles()
  },[]);

  const obtenerDetalles2 = async() =>{
  }
  
  return (
    <div className="col-md-4">
      <div className='card'>
        <div className="card-header">
          <h5>Detalles de la evaluacion</h5>
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <input type="text" className='form-control' value='Hola' />
          </div>
          <div className="input-group mb-3">
            <input type="text" className='form-control' value='Hola' />
          </div>
          <div className="input-group mb-3">
            <input type="text" className='form-control' value='Hola' />
          </div>
          <div className="input-group mb-3">
            <input type="text" className="form-control" value='alumnos que votaron'/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluacionDocDetalle