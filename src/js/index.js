import 'babel-polyfill';
import _ from 'lodash';

import './../sass/styles.scss';
//import 'font-awesome/sass/font-awesome.min.scss';
//import { threadId } from 'worker_threads';

void function () {
  let blurVal = 15, LOGIN = false, currentUserChatId = 0, messages = [], users = [], loggedUser = '';

  document.addEventListener( "DOMContentLoaded", function() {

  // размытость пока не залогинишься:
  //document.querySelector('body > div.container.clearfix').style.filter = 'blur('+blurVal+'px)';

  document.querySelector('body > div.login-modal').style.display = "none";   // для отсутствия окна "логина и пароля"
  blurVal = 0;                                                               // закрытие чата размытием

});

}();