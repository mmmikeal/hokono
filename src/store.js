import { createStore, combineReducers } from 'redux';
import PetsReducer from './reducers/PetsReducer';
import ShelterProfReducer from './reducers/ShelterProfReducer';
import AuthReducer from './reducers/AuthReducer';
import GlobalPetsReducer from './reducers/GlobalPetsReducer';
import PostsReducer from './reducers/PostsReducer';
import FollowingReducer from './reducers/FollowingReducer';
import firebase from './firebase/index';
import fb from 'firebase';
import { signinAction } from './actions/AuthActions';

const comboReducer = combineReducers({
  pets: PetsReducer,
  profile: ShelterProfReducer,
  auth: AuthReducer,
  gPets: GlobalPetsReducer,
  posts: PostsReducer,
  following: FollowingReducer,
});



const user = firebase.auth().currentUser;

const auth = !user ? { loggedIn: false } :
  {
    loggedIn: true,
    username: user.email,
    uid: user.uid,
    userObj: user,
  };

const profile = !user ? {} :
  {
    displayName: user.displayName,
    email: user.email,
    address: user.address,
    phone: user.phoneNumber,
  };

const store = createStore(comboReducer, {
  auth,
  profile: {...profile, got: false},
});

fb.auth().onAuthStateChanged((user) => {
  if (user) {
    signinAction();
  }
});

export default store;
