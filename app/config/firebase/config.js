import firebase from 'firebase'; // Version can be specified in package.json

const config = {
  apiKey: "AIzaSyAVlCCLNO62hWtQuoAJY7M2_DK_tUDYDWg",
  authDomain: "ebihaze-1b780.firebaseapp.com",
  databaseURL: "https://ebihaze-1b780.firebaseio.com",
  projectId: "ebihaze-1b780",
  storageBucket: "ebihaze-1b780.appspot.com",
  messagingSenderId: "691052898913"
};

try {
  firebase.initializeApp(config);
} catch (e) {
  console.log('App reloaded, so firebase did not re-initialize')
}

export default {}