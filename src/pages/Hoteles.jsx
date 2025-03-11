import React, { useState, useEffect } from "react";
import { getHoteles, deleteHotel } from "../services/api";
import { useNavigate } from "react-router-dom";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const Hoteles = () => {
  const [hoteles, setHoteles] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarHoteles();
  }, []);

  const cargarHoteles = async () => {
    try {
      const response = await getHoteles();
      setHoteles(response.data);
    } catch (error) {
      console.error("Error al obtener hoteles:", error);
    }
  };

  const handleEliminarHotel = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este hotel?")) {
      try {
        await deleteHotel(id);
        setSuccessMessage("Hotel eliminado correctamente.");
        cargarHoteles();

        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error al eliminar hotel:", error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-center mb-4">Administración de Hoteles</h1>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => navigate("/agregar-hotel")}
      >
        Agregar Hotel
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>NIT</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {hoteles.length > 0 ? (
            hoteles.map((hotel) => (
              <tr key={hotel.id}>
                <td>{hotel.nombre}</td>
                <td>{hotel.direccion}</td>
                <td>{hotel.municipio?.municipio || "N/A"}</td>
                <td>{hotel.nit}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/editar-hotel/${hotel.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEliminarHotel(hotel.id)}
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() =>
                      navigate(`/hoteles/${hotel.id}/asignar-habitaciones`)
                    }
                  >
                    Asignar Habitaciones
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No hay hoteles registrados
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default Hoteles;
