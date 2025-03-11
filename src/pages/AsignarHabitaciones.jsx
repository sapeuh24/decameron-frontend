import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAcomodacionesTipos,
  updateHabitaciones,
  getHabitacionesPorHotel,
  getHotelById,
} from "../services/api";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Select from "react-select";
import Alert from "react-bootstrap/Alert";
import Table from "react-bootstrap/Table";

const AsignarHabitaciones = () => {
  const { hotel_id } = useParams();
  const navigate = useNavigate();

  const [acomodacionesTipos, setAcomodacionesTipos] = useState([]);
  const [selectedCombinacion, setSelectedCombinacion] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [habitacionesTemporales, setHabitacionesTemporales] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [hotelInfo, setHotelInfo] = useState({
    numeroHabitaciones: 0,
    habitacionesOcupadas: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const acomodacionesResponse = await getAcomodacionesTipos();
        if (
          acomodacionesResponse.data &&
          Array.isArray(acomodacionesResponse.data.data)
        ) {
          setAcomodacionesTipos(acomodacionesResponse.data.data);
        } else {
          console.error(
            "La respuesta no es un array:",
            acomodacionesResponse.data
          );
          setAcomodacionesTipos([]);
        }

        const habitacionesResponse = await getHabitacionesPorHotel(hotel_id);
        if (
          habitacionesResponse.data &&
          Array.isArray(habitacionesResponse.data.data)
        ) {
          const habitacionesConNombres = habitacionesResponse.data.data.map(
            (hab) => {
              const combinacion = acomodacionesResponse.data.data.find(
                (combi) => combi.id === hab.acomodacion_tipo_id
              );
              return {
                ...hab,
                tipo_habitacion_nombre: combinacion
                  ? combinacion.tipo_habitacion_nombre
                  : "Desconocido",
                acomodacion_nombre: combinacion
                  ? combinacion.acomodacion_nombre
                  : "Desconocido",
              };
            }
          );

          setHabitacionesTemporales(habitacionesConNombres);

          const habitacionesOcupadas = habitacionesConNombres.reduce(
            (total, hab) => total + hab.cantidad,
            0
          );

          const hotelResponse = await getHotelById(hotel_id);
          if (hotelResponse.data) {
            setHotelInfo({
              numeroHabitaciones: hotelResponse.data.numero_habitaciones,
              habitacionesOcupadas,
            });
          } else {
            console.error("No se pudo obtener la información del hotel.");
          }
        } else {
          console.error(
            "La respuesta no tiene el formato esperado:",
            habitacionesResponse.data
          );
          setHabitacionesTemporales([]);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setErrors({
          general: "Error al cargar los datos. Inténtalo de nuevo más tarde.",
        });
      }
    };

    cargarDatos();
  }, [hotel_id]);

  const handleCombinacionChange = (selectedOption) => {
    setSelectedCombinacion(selectedOption);
  };

  const handleCantidadChange = (e) => {
    setCantidad(e.target.value);
  };

  const handleAgregarHabitacion = () => {
    if (!selectedCombinacion || cantidad < 1) {
      setErrors({
        general: "Debes seleccionar una combinación y una cantidad válida.",
      });
      return;
    }

    const existe = habitacionesTemporales.some(
      (hab) => hab.acomodacion_tipo_id === selectedCombinacion.value
    );

    if (existe) {
      setErrors({ general: "Esta combinación ya fue agregada." });
      return;
    }

    const nuevaHabitacion = {
      acomodacion_tipo_id: selectedCombinacion.value,
      tipo_habitacion_nombre: selectedCombinacion.label.split(" - ")[0],
      acomodacion_nombre: selectedCombinacion.label.split(" - ")[1],
      cantidad: parseInt(cantidad),
    };

    setHabitacionesTemporales([...habitacionesTemporales, nuevaHabitacion]);

    setHotelInfo((prev) => ({
      ...prev,
      habitacionesOcupadas:
        prev.habitacionesOcupadas + nuevaHabitacion.cantidad,
    }));

    setSelectedCombinacion(null);
    setCantidad(1);
    setErrors({});
  };

  const handleEliminarHabitacion = (index) => {
    const habitacionEliminada = habitacionesTemporales[index];
    const nuevasHabitaciones = habitacionesTemporales.filter(
      (_, i) => i !== index
    );
    setHabitacionesTemporales(nuevasHabitaciones);

    setHotelInfo((prev) => ({
      ...prev,
      habitacionesOcupadas:
        prev.habitacionesOcupadas - habitacionEliminada.cantidad,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (habitacionesTemporales.length === 0) {
      setErrors({ general: "Debes agregar al menos una habitación." });
      return;
    }

    try {
      const habitacionesParaEnviar = habitacionesTemporales.map((hab) => ({
        acomodacion_tipo_id: parseInt(hab.acomodacion_tipo_id),
        cantidad: parseInt(hab.cantidad),
      }));

      const data = {
        hotel_id: parseInt(hotel_id),
        habitaciones: habitacionesParaEnviar,
      };

      console.log("Datos enviados:", data);

      await updateHabitaciones(hotel_id, data);

      setSuccessMessage("Habitaciones actualizadas correctamente.");
      setTimeout(() => setSuccessMessage(""), 3000);

      setTimeout(async () => {
        await cargarDatos();
      }, 500);
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Error al actualizar habitaciones:", error);
        setErrors({
          general: "Ocurrió un error al actualizar las habitaciones.",
        });
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Form
        onSubmit={handleSubmit}
        className="w-50 bg-light p-4 rounded shadow"
      >
        <h2 className="text-center mb-4">Asignar Habitaciones</h2>

        <div className="mb-4">
          <p>Total de habitaciones: {hotelInfo.numeroHabitaciones}</p>
          <p>Habitaciones ocupadas: {hotelInfo.habitacionesOcupadas}</p>
          <p>
            Habitaciones disponibles:{" "}
            {hotelInfo.numeroHabitaciones - hotelInfo.habitacionesOcupadas}
          </p>
        </div>

        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errors.general && <Alert variant="danger">{errors.general}</Alert>}

        {Object.keys(errors).map(
          (key) =>
            key !== "general" && (
              <Alert key={key} variant="danger">
                {errors[key][0]}
              </Alert>
            )
        )}

        <Form.Group className="mb-3">
          <Form.Label>
            Combinación (Tipo de Habitación - Acomodación)
          </Form.Label>
          <Select
            options={acomodacionesTipos.map((item) => ({
              value: item.id,
              label: `${item.tipo_habitacion_nombre} - ${item.acomodacion_nombre}`,
            }))}
            value={selectedCombinacion}
            onChange={handleCombinacionChange}
            placeholder="Seleccione una combinación..."
            isSearchable
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cantidad</Form.Label>
          <Form.Control
            type="number"
            value={cantidad}
            onChange={handleCantidadChange}
            min="1"
            required
          />
        </Form.Group>

        <Button
          type="button"
          variant="primary"
          className="mb-3"
          onClick={handleAgregarHabitacion}
        >
          Agregar Habitación
        </Button>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Tipo de Habitación</th>
              <th>Acomodación</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitacionesTemporales.map((hab, index) => (
              <tr key={index}>
                <td>{hab.tipo_habitacion_nombre}</td>
                <td>{hab.acomodacion_nombre}</td>
                <td>{hab.cantidad}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEliminarHabitacion(index)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button type="submit" variant="success">
          Guardar Cambios
        </Button>
      </Form>
    </div>
  );
};

export default AsignarHabitaciones;
