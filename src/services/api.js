import axios from "axios";

const api = axios.create({
    baseURL: "https://decameron-api-production.up.railway.app/api",
});

// Hoteles
export const getHoteles = () => api.get("/hoteles");
export const createHotel = (hotel) => api.post("/hoteles", hotel);
export const getHotelById = (hotelId) => api.get(`/hoteles/${hotelId}`);
export const updateHotel = (id, hotel) => api.put(`/hoteles/${id}`, hotel);
export const deleteHotel = (id) => api.delete(`/hoteles/${id}`);

export const getMunicipios = () => api.get("/municipios");

export const getHabitacionesPorHotel = (hotelId) => api.get(`/habitaciones/hotel/${hotelId}`);
export const createHabitacion = (datos) => api.post("/habitaciones", datos);
export const updateHabitaciones = (hotelId, habitaciones) =>
    api.put(`/hoteles/${hotelId}/habitaciones`, { habitaciones });

export const getAcomodacionesTipos = () => api.get("/acomodaciones-tipos");

export default api;
