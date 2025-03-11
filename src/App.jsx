import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hoteles from "./pages/Hoteles";
import AgregarHotel from "./pages/AgregarHotel";
import EditarHotel from "./pages/EditarHotel";
import AsignarHabitaciones from "./pages/AsignarHabitaciones";

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Hoteles />} />
          <Route path="/agregar-hotel" element={<AgregarHotel />} />
          <Route path="/editar-hotel/:id" element={<EditarHotel />} />
          <Route
            path="/hoteles/:hotel_id/asignar-habitaciones"
            element={<AsignarHabitaciones />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
