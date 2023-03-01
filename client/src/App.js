import { createBrowserRouter, RouterProvider } from 'react-router-dom'

/**import compnents */
import Username from './components/Username'
import Password from './components/Password'
import Register from './components/Register'
import Reset from './components/Reset'
import Recovery from './components/Recovery'
import Profile from './components/Profile'
import Error from './components/Error'

/**Auth middleware */
import { AuthorizeUser } from './middleware/auth'



/**root routes */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Username></Username>
  },
  {
    path: '/register',
    element: <Register></Register>
  },
  {
    path: '/password',
    element:<Password></Password>
  },{
    path: '/error',
    element: <Error></Error>
  },{
    path: '/profile',
    element: <AuthorizeUser><Profile/> </AuthorizeUser>
  },
  {
    path: '/recovery',
    element: <Recovery></Recovery>
  },
  {
    path: '/reset',
    element: <Reset></Reset>
  },

])

function App() {
  return (
    <main className="App">
      
      <RouterProvider router={router}>

      </RouterProvider>
    </main>
  );
}

export default App;
