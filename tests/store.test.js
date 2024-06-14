import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

// Middleware you use in your store configuration
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('store', () => {
  it('should initialize with the initial state from the reducers', () => {
    const store = mockStore(rootReducer(undefined, {}));
    expect(store.getState()).toEqual(rootReducer(undefined, {}));
  });

  // Add more tests here to test specific actions and state changes
});