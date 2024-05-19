import { Route, Routes } from "react-router-dom";
import NavBar from "./shared/core/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Page404 from "./pages/Page404";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./pages/Error";

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
