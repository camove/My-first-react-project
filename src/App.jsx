import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RoutesStructure from "./Routes/RoutesStructure";
import { AuthContext, AuthProvider } from "./Context/AuthContext";

const router = createBrowserRouter(RoutesStructure);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
