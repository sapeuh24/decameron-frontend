import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHotelById, updateHotel, getMunicipios } from "../services/api";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Select from "react-select";
import Alert from "react-bootstrap/Alert";

const EditarHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    municipio_id: "",
    nit: "",
    numero_habitaciones: "",
  });

  const [municipios, setMunicipios] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [hotelResponse, municipiosResponse] = await Promise.all([
          getHotelById(id),
          getMunicipios(),
        ]);

        setFormData({
          nombre: hotelResponse.data.nombre,
          direccion: hotelResponse.data.direccion,
          municipio_id: hotelResponse.data.municipio_id,
          nit: hotelResponse.data.nit,
          numero_habitaciones: hotelResponse.data.numero_habitaciones,
        });

        setMunicipios(municipiosResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMunicipioChange = (selectedOption) => {
    setFormData({ ...formData, municipio_id: selectedOption.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await updateHotel(id, formData);
      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al actualizar hotel:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando datos...</div>;
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Form
        onSubmit={handleSubmit}
        className="w-50 bg-light p-4 rounded shadow"
      >
        <h2 className="text-center mb-4">Editar Hotel</h2>

        {Object.keys(errors).length > 0 && (
          <Alert variant="danger">
            <ul className="mb-0">
              {Object.entries(errors).map(([field, messages]) =>
                messages.map((msg, index) => (
                  <li key={`${field}-${index}`}>{msg}</li>
                ))
              )}
            </ul>
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            isInvalid={!!errors.nombre}
          />
          <Form.Control.Feedback type="invalid">
            {errors.nombre?.[0]}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            required
            isInvalid={!!errors.direccion}
          />
          <Form.Control.Feedback type="invalid">
            {errors.direccion?.[0]}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Municipio</Form.Label>
          <Select
            options={municipios.map((m) => ({
              value: m.id_municipio,
              label: m.municipio,
            }))}
            value={
              municipios.find((m) => m.id_municipio === formData.municipio_id)
                ? {
                    value: formData.municipio_id,
                    label: municipios.find(
                      (m) => m.id_municipio === formData.municipio_id
                    ).municipio,
                  }
                : null
            }
            onChange={handleMunicipioChange}
            placeholder="Seleccione un municipio..."
            isSearchable
          />
          {errors.municipio_id && (
            <div className="text-danger mt-1">{errors.municipio_id?.[0]}</div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>NIT</Form.Label>
          <Form.Control
            type="text"
            name="nit"
            value={formData.nit}
            onChange={handleInputChange}
            required
            isInvalid={!!errors.nit}
          />
          <Form.Control.Feedback type="invalid">
            {errors.nit?.[0]}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Número de Habitaciones</Form.Label>
          <Form.Control
            type="number"
            name="numero_habitaciones"
            value={formData.numero_habitaciones}
            onChange={handleInputChange}
            min="1"
            required
            isInvalid={!!errors.numero_habitaciones}
          />
          <Form.Control.Feedback type="invalid">
            {errors.numero_habitaciones?.[0]}
          </Form.Control.Feedback>
        </Form.Group>

        <Button type="submit" variant="primary">
          Guardar Cambios
        </Button>
      </Form>
    </div>
  );
};

export default EditarHotel;
