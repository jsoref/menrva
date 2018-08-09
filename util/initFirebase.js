import firebase from "firebase";

export default function initFirebase() {
  const config = {
    apiKey: "AIzaSyDaSF8PfdRA1mjztmQQKWV0v6BusUjvko4",
    authDomain: "sercy-2de63.firebaseapp.com",
    databaseURL: "https://sercy-2de63.firebaseio.com",
    projectId: "sercy-2de63",
    storageBucket: "sercy-2de63.appspot.com",
    messagingSenderId: "724512766832",
  };

  if (!firebase.apps?.length) {
    console.log("initializeApp");
    firebase.initializeApp(config);
  }
}
