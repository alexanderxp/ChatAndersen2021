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
 
    let requestUsers = new XMLHttpRequest();
    let requestMessages = new XMLHttpRequest();
    requestUsers.open('GET', 'https://studentschat.herokuapp.com/users', true);
    requestMessages.open('GET', 'https://studentschat.herokuapp.com/messages', true);

    requestUsers.onload = function() {
      if (requestUsers.status >= 200 && requestUsers.status < 400) {
      // Обработчик успещного ответа
        let response = requestUsers.responseText;
        users = JSON.parse(response);

        document.querySelector('.onlinemembers > span').innerText = getNumberOfActiveUsers();
        
        JSON.parse(response).forEach(                                              // изменение цвета online offline )
          function (user, i) {
            let ulDomElement = document.getElementById('users-list');
            let liDomElement = document.createElement('li');
            let status = '';
            switch (user.status) {
              case 'active':
                status = 'online';
                break;
              case 'inactive':
                status = 'offline';
                break;
            }
            liDomElement.innerHTML = ' ' +
              '<li class="clearfix" data-id="' + user.user_id + '">' +
              // '<img src="images/0' + Number(i+1) + '.png" alt="avatar">' +
              '<div class="about">' +
              '<div class="name">' + user.username + '</div>' +
              '<div class="status">' +
              '<i class="fa fa-circle ' + status + '"></i>'+ status +''
              '</div>' +
              '</div>' +
              '</li>';
            ulDomElement.appendChild(liDomElement);
          });

        document.querySelectorAll('.list .clearfix').forEach(function (listElement) { // user-list click
          let chatContainer = document.getElementById('chat-container');
            listElement.addEventListener('click', function () {
              currentUserChatId = this.getAttribute('data-id');
                let currentMessagesList = getMessagesByUserId(currentUserChatId);
                chatContainer.innerHTML = '';
                  currentMessagesList.forEach(userMessage => {
                    chatContainer.innerHTML += 
                    '<li>' +
                      '<div class="message-data">' +
                        '<span class="message-data-name"><i class="fa fa-circle ' + this.firstChild.lastChild.firstChild.className.split(' ')[2] + '"></i>' + this.firstChild.firstChild.innerText + '</span>' +
                        '<span class="message-data-time">' + datePicker(new Date(userMessage.datetime)) + '</span>' +
                      '</div>' +
                      '<div class="message my-message">' + userMessage.message + '</div>' +
                    '</li>';
                  });
                document.getElementById('chat-container').scrollIntoView(false);
                document.querySelector('.chat-num-messages > span').innerText = currentMessagesList.length;
                document.querySelector('div.chat-with').innerText = this.firstChild.firstChild.innerText;
            });
        });
      } else {
      // Обработчик ответа в случае ошибки
      }
    };
    requestUsers.onerror = function() {
    // Обработчик ответа в случае неудачного соеденения
    };
     requestUsers.send();

  });

}();