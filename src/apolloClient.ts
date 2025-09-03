import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Configura el enlace HTTP para Apollo
const httpLink = new HttpLink({
  // uri: 'http://localhost:4000/graphql',  
    uri: `${import.meta.env.VITE_API_BASE_URL}`,
});

// Usa setContext para agregar el token JWT a las cabeceras
const authLink = setContext((_, { headers }) => {
  // Obtén el token desde donde lo guardaste, por ejemplo, en el estado global o en localStorage
  const token = localStorage.getItem('token'); // O donde tengas el token

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '', // Si hay token, lo agregamos
    },
  };
});

// Crea el cliente Apollo usando authLink y httpLink
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
