import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import ErrorPage from "./pages/error-page/ErrorPage.tsx";
import App from "./App.tsx";
import AuthenticationPage from "./pages/authentication-page/AuthenticationPage.tsx";
import {Provider} from "react-redux";
import store from "./store/store.ts";
import HomePage from "./pages/home-page/HomePage.js";
import FilmDetails from "./pages/film-details/FilmDetails";
import Favourites from "./pages/favourites-page/Favourites";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: '/', element: <HomePage/>
      },
      {
        path: '/authentication', element:
            <AuthenticationPage/>
      },
      {
        path: "/movie/:filmId",
        element: <FilmDetails />,
      },
      {
        path: "/favourites",
        element: <Favourites />,
      },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
)