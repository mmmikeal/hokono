import firebase from '../firebase/index';
import store from '../store';

export const userFollowedPet = (pet) => {
  const action = {
    type: 'FOLLOW_A_PET'
  };
  //pet has to be pet object
  //assume this is correct way to get user id and not shelterId
  const user = firebase.auth().currentUser;
  var updates = {};
  //these three API calls can be reduced with serverside cloud code
  //indented here to remember to go back to reduce API calls
    //user adds pet to his list of following
    //petowner.pet adds new userfollower to his pets followers
    const owner = pet.ownerUid;

    var obj1 = {};
    obj1[pet.id] = { nameDisplay: user.displayName };

    //followers and following user ids updated in following:{userid:{}, userid:{}} format
    updates[`/accounts/${user.uid}/following/` + pet.id] = { name: pet.name };
    updates[`/pets/${pet.id}/followers/` + user.uid] = { displayName: user.displayName };
    updates[`/accounts/${owner}/pets/${pet.id}/followers/` + user.uid] = { displayName: user.displayName };

    //counts for followers and following
    updates[`/accounts/${user.uid}/followingCount/`] =  store.getState().profile.followingCount + 1 || 1;
    updates[`/pets/${pet.id}/followersCount/`] = pet.followersCount + 1 || 1;
    updates[`/accounts/${owner}/pets/${pet.id}/followersCount/`] = pet.followersCount + 1 || 1;

    firebase.database().ref().update(updates).then(() => {
      action.data = { following: obj1 };
      action.payload = "success";
      store.dispatch(action);
    }, (err) => {
      action.payload = "err";
      throw err;
    });
}

export const userLikedPet = (pet) => {
  const action = {
    type: 'LIKED_A_PET'
  };

  const user = firebase.auth().currentUser;
  const userid = user.uid;
  var updates = {};
  const owner = pet.ownerUid;

  var obj1 = {};
  obj1[pet.id] = { nameDisplay: user.displayName };
  const currTime = Date.now();

  updates[`/accounts/${user.uid}/myLikes/` + pet.id] = { name: pet.name };
  updates[`/pets/${pet.id}/likedBy/` + user.uid] = { displayName: user.displayName, createdAt: currTime };
  updates[`/accounts/${owner}/pets/${pet.id}/likedBy/` + user.uid] = { displayName: user.displayName, createdAt: currTime };

  //counts for followers and following
  updates[`/pets/${pet.id}/likes/`] = pet.likes + 1 || 1;
  updates[`/accounts/${owner}/pets/${pet.id}/likes/`] = pet.likes + 1 || 1;

  firebase.database().ref().update(updates).then(() => {
    //updates the users likes in state/store
    action.data = { myLikes: obj1 };
    pet.likes = pet.likes + 1 || 1;
    const emptyObj = {};
    emptyObj[user.uid] = { displayName: user.displayName, createdAt: currTime };
    pet.likedBy = emptyObj;
    const emptyObj2 = {};
    emptyObj2[pet.id] = pet;

    //updates the globalpetfeed state/store with likes
    action.dataPet = { emptyObj2 };
    action.payload = "success";
    store.dispatch(action);
  }, (err) => {
    action.payload = "err";
    throw err;
  });
}

export const userUnlikedPet = (pet) => {
  const action = {
    type: 'UNLIKED_A_PET'
  };

  const user = firebase.auth().currentUser;
  var updates = {};
  const owner = pet.ownerUid;

  const obj1 = {};
  obj1[pet.id] = null;

  updates[`/accounts/${user.uid}/myLikes/` + pet.id] = null;
  updates[`/pets/${pet.id}/likedBy/` + user.uid] = null;
  updates[`/accounts/${owner}/pets/${pet.id}/likedBy/` + user.uid] = null;

  //counts for followers and following
  updates[`/pets/${pet.id}/likes/`] = pet.likes - 1 || 0;
  updates[`/accounts/${owner}/pets/${pet.id}/likes/`] = pet.likes - 1 || 0;

  firebase.database().ref().update(updates).then(() => {
    //updates a users unlikes in state/store
    action.data = { myLikes: obj1 };
    pet.likes = pet.likes - 1 || 0;
    const emptyObj = {};
    emptyObj[user.uid] = null;
    pet.likedBy = emptyObj;
    const emptyObj2 = {};
    emptyObj2[pet.id] = pet;

    //updates a pets unlikes in state/store
    action.dataPet = { emptyObj2 };
    action.payload = "success";
    store.dispatch(action);
  }, (err) => {
    action.payload = "err";
    throw err;
  });
}
