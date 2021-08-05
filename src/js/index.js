import 'babel-polyfill';
import _ from 'lodash';

import './../sass/styles.scss';
//import 'font-awesome/sass/font-awesome.min.scss';
//import { threadId } from 'worker_threads';


void function () {
    let blurVal = 15, LOGIN = false, currentUserChatId = 0, messages = [], users = [], loggedUser = '';


    function toMMSS (seconds) {                     // функция счета секунд online
        let date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(14, 5);
    }

    document.addEventListener( "DOMContentLoaded", function() {


        
		// размытость пока не залогинишься:
		document.querySelector('body > div.container.clearfix').style.filter = 'blur('+blurVal+'px)';
        
        let timerElement = document.querySelector('.timeonline > .youstatus > .fa + span');              // селектор для функции подсчета секунд online
        
        // отображение времени ( часы и минуты ) в левом верхнем углу .
        document.querySelector('.timeonline > p > span').innerText = ((new Date).getHours() + ':' + (new Date).getMinutes());

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

        requestMessages.onload = function() {
            if (requestMessages.status >= 200 && requestMessages.status < 400) {
            // Обработчик успешного ответа
            let response = requestMessages.responseText;
            
            JSON.parse(response).forEach(
                function (user, i) {
                    let divChatWithElement = document.getElementsByClassName('chat-with')[0];
                    divChatWithElement.innerText = user.chatroom_id;
                    document.querySelector('body > div.container.clearfix > div.chat > div.chat-history > ul > li:nth-child(1) > div.message.my-message').innerText = user.message;
                }
            );
            messages = JSON.parse(response);
            document.querySelector('.countMe').innerText = messages.length;   // селектор подсчета сообщений всех пользователей чата 
            } else {
            // Обработчик ответа в случае ошибки
            }
        };
        requestMessages.onerror = function() {
            // Обработчик ответа в случае неудачного соеденения
        };
        requestMessages.send();		
		
        document.querySelector('body > div.login-modal > button').addEventListener('click', function () {
            let requestLogin = new XMLHttpRequest();
            requestLogin.open('POST', 'https://studentschat.herokuapp.com/users/login', true);

            loggedUser = document.querySelector('body > div.login-modal > div:nth-child(2) > input').value;   // селектор отсчета времени после залогивания

            requestLogin.onerror = function() {};

            requestLogin.onload = function() {
                //document.querySelector('body > div.container.clearfix').style.visibility = "visible";
                let i = blurVal;
                document.querySelector('body > div.login-modal').style.display = "none";
                let blurEffectInterval = setInterval(function () {
                    if (!i) {
                        clearInterval(blurEffectInterval);
                    }
                    document.querySelector('body > div.container.clearfix').style.filter = 'blur('+i--+'px)';                    
                }, 50);
                document.querySelector('.to-display').innerText = 'Logout';
                LOGIN = true;
                setInterval(function () {                                          // функция для подсчета секунд online
                    timerElement.innerText = +timerElement.innerText + 1;
                }, 1000);

            };
            requestLogin.setRequestHeader('Content-Type', 'application/json');

            // текущая дата для  requestLogin.send(JSON.stringify({    ---    let date = new Date().toISOString();
            let date = new Date().toISOString();

            // let userName = user;

            // let messUser = document.getElementById('messages').value;

            requestLogin.send(JSON.stringify({     // POST    https://studentschat.herokuapp.com/users/login    403 (Forbidden)
              message: messages, username: loggedUser    // datetime: date, message: messages, username: loggedUser
            }));
        });

        document.querySelector('body > div.container.clearfix > div.chat > div.chat-history > ul > li:nth-child(1) > div.message.my-message').innerText = 'Здравствуйте. (Это встроенное сообщение)';

        document.getElementById('send-message').addEventListener('click', function () {
            if (!document.getElementById('message-to-send').value.trim()) {
                alert('Вы ввели пустое сообщение.');
                return;
            }
            let messageFragment = document.createElement('li');
            messageFragment.className = 'clearfix';
            messageFragment.innerHTML = 
            '<div class="message-data align-right">' +
                '<span class="message-data-time">' + datePicker(new Date) + '</span> &nbsp; &nbsp;' +
                '<span class="message-data-name">Вы</span> <i class="fa fa-circle me"></i>' +
            '</div>' +
            '<div class="message other-message float-right">' + document.getElementById('message-to-send').value + 
            '</div>';
            document.getElementById('chat-container').appendChild(messageFragment);
            
            let requestMessagePost = new XMLHttpRequest();
            requestMessagePost.open('POST', 'https://studentschat.herokuapp.com/messages', true);
            
            
            requestMessagePost.onload = function() {
                // Обработчик ответа в случае удачного соеденения
                console.log('Message post success!');
            };
            
            requestMessagePost.onerror = function() {
                // Обработчик ответа в случае неудачного соеденения
                //document.querySelector('body > div.container.clearfix').style.visibility = "visible";
                console.log('Что-то пошло не так');
            };
            requestMessagePost.setRequestHeader('Content-Type', 'application/json');
            
            requestMessagePost.send(JSON.stringify({    // POST https://studentschat.herokuapp.com/messages 403 (Forbidden)
                datetime:(new Date()).toJSON(),
                message: document.getElementById('message-to-send').value,
                user_id: currentUserChatId
            }));
            
            document.getElementById('message-to-send').value = '';
        });
    });

             
	// меняет имена пользователей в окне сообщений
    function getMessagesByUserId(userId) {
        return messages.filter(function (user) {
            return user.user_id === userId;
        });
    }

	// получает пользователей в левое окно
    function getNumberOfActiveUsers() {
        return users.filter(function (user) {
            return user.status === 'active';
        }).length;
    }


    function datePicker(date) {
        return date.getHours() + ':' + date.getMinutes() + ', ' + date.toLocaleDateString();
    }


	// прописывает работу кнопки закрывания окна "логина и пароля"
    let closeBtn = document.querySelector('.close-sign');

    closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector('.login-modal').style.display =  'none';
    });

  // прописывает работу кнопки 'Login'  и кнопки 'Logout'
    document.querySelector('.to-display').addEventListener('click', function () {
      if (LOGIN) {
          this.innerText = 'Login';
          document.querySelector('body > div.container.clearfix').style.filter = 'blur('+blurVal+'px)';
          document.querySelector('div.login-modal').style.display = 'inline-block';
      }

  }); 

}();
