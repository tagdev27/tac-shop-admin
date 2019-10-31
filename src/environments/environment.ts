// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
const firebaseConfig = {
  apiKey: "AIzaSyAu77RE_S5__DnrmaR1LKJvqtNNyR0mSzo",
  authDomain: "taconlinegiftshop.firebaseapp.com",
  databaseURL: "https://taconlinegiftshop.firebaseio.com",
  projectId: "taconlinegiftshop",
  storageBucket: "taconlinegiftshop.appspot.com",
  messagingSenderId: "640531224553",
  appId: "1:640531224553:web:1841f3f75b6240af"
};

export const environment = {
  production: false,
  firebase: firebaseConfig
};

