import AppLayout from "../01 AppLayout/AppLayout";
import Register, { actionRegisterUser } from "../03 Register/Register";
import Login from "../02 Login/Login";
import HomePage from "../04 HomePage/HomePage";
import AllUsers from "../05 AllUsers/AllUsers";
import Logout from "../06 Logout/Logout";
import DeleteAccount from "../07 DeleteAccount/DeleteAccount";
import EditProfile, { actionEditProfile, loaderEditProfile } from "../08 EditProfile/EditProfile";
import AddFlat, { actionAddFlat } from "../09 AddFlat/AddFlat";
import FlatDetails from "../10 FlatDetails/FlatDetails";
import EditFlat, { actionEditFlat, loaderEditFlat } from "../11 EditFLat/EditFlat";
import MyFlats from "../12 MyFlats/MyFlats";
import Favourites from "../13 Favourites/Favourites";
import Error404 from "../Utils/Error404";
import SessionEnded from "../Utils/SessionEnded";

const RoutesStructure = [
    {
      path: '/', 
      element: <AppLayout/>,
      children: [
        {
          index: true, //default route
          path: '/login',
          element: <Login/>
        },
        {
          path: '/register',
          element: <Register/>,
          action: actionRegisterUser,
        },
        { path: '/user/:id', 
          element: <HomePage/>,
        },
        { path: '/all-users', 
          element: <AllUsers/> 
        },
        { path: '/logout', 
          element: <Logout/>
        },
        { path: '/delete-account', 
        element: <DeleteAccount/> 
        },
        { path: '/edit-profile/:id',
          element: <EditProfile/>,
          loader: loaderEditProfile,
          action: actionEditProfile,
        },
        { path: '/add-flat', 
          element: <AddFlat/>, 
          action: actionAddFlat, 
        },
        { path: '/flat/:id', 
          element: <FlatDetails/> 
        },
        { path: '/edit-flat/:id', 
          element: <EditFlat/>, 
          action: actionEditFlat, 
          loader: loaderEditFlat, 
        },
        { path: '/my-flats', 
        element: <MyFlats/> 
        },
        { path: '/favourites', 
          element: <Favourites/>, 
        },
        { path: '/logoutTimer',
          element: <SessionEnded/>,
        },
        { path: '*',
          element: <Error404/>,
        },
      ]
    }
  ]

  export default RoutesStructure;