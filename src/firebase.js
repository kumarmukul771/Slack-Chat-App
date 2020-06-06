import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/storage';

var firebaseConfig = {
    apiKey: "AIzaSyCEgIAKG4TMCVdzDfJALflLLFQF6Wlq_84",
    authDomain: "react-slack-clone-495a4.firebaseapp.com",
    databaseURL: "https://react-slack-clone-495a4.firebaseio.com",
    projectId: "react-slack-clone-495a4",
    storageBucket: "react-slack-clone-495a4.appspot.com",
    messagingSenderId: "360605162105",
    appId: "1:360605162105:web:b365192757e80e37f112a8",
    measurementId: "G-39SY1EDN0C"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//   firebase.analytics();

export default firebase;