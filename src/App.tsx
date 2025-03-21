import { JSX } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import IDEPage from './pages/IDEPage';
import { persistor, store } from './store';

const App = (): JSX.Element => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <IDEPage />
      </PersistGate>
    </Provider>
  );
};

export default App;
