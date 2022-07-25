class Chat {
    constructor() {
      this.socket = null
      this.openedYet = false
      this.chatName = ""
      this.nickName = document.querySelector("#nickname")
      this.userCount = document.querySelector("#userCount")
      this.chatField = document.querySelector("#chatMessage")
      this.chatLog = document.querySelector(".messages")
      this.sendButton = document.querySelector("#sendMsg")
      this.nickNameSelector = document.querySelector("#nicknameSelector")
      this.nickNameSubmit = document.querySelector("#nicknameSubmit")
      this.alreadyExistedName = document.querySelector("#alreadyExistedName")
      this.events()
      this.openConnection()
    }
  
    // Events
    events() {
    this.socket = io.connect()
      this.sendButton.addEventListener("click", (e) => {
        e.preventDefault()
        this.sendMessageToServer()
      })
      this.nickNameSubmit.addEventListener("click", (e) => {
          e.preventDefault()
          this.socket.emit('login', {nickname: this.nickNameSelector.value})
          
      })
  
      this.socket.on('loginSuccess', (data) => {
        console.log(data)
        this.chatName = data.nickname
        this.nickName.style.display = 'none'
      })
  
      this.socket.on('nickExisted', () => {
        console.log("nickname existed")
        this.alreadyExistedName.textContent = "NickName Alrady Existed, try with different name"
      })
  
      this.socket.on('system', (data) => {
          let txt = data.type === 'login' ? 'joined' : 'left'
          this.userCount.textContent = data.total
          this.displaySystemMessage({username: data.nickname, message: txt})
      })
    }
  
    // Methods
    sendMessageToServer() {
      this.socket.emit('chatMessageFromBrowser', {message: this.chatField.value, username: this.chatName})
      this.chatLog.insertAdjacentHTML('beforeend',`
      <div class="my-chat">
              <div class="msg">
                  <span>${this.chatName}: </span>
                  <span>${this.chatField.value}</span>
              </div>
          </div>
      `)
      this.chatLog.scrollTop = this.chatLog.scrollHeight
      this.chatField.value = ''
      this.chatField.focus()
    }
  
    hideModal() {
      this.nickName.classList.remove("modal--visible")
    }
  
    showChat() {
      if (!this.openedYet) {
        this.openConnection()
      }
      this.openedYet = true
      this.nickName.classList.add("modal--visible")
      this.nickNameSelector.focus()
    }
  
    openConnection() {
      this.socket.on('chatMessageFromServer', (data) => {
        this.displayMessageFromServer(data)
      })
    }
  
    displaySystemMessage(data) {
      this.chatLog.insertAdjacentHTML('beforeend', `
      <div class="other-chat">
              <div class="msg">
                  <span>${data.username}</span>
                  <span>${data.message}</span>
              </div>
          </div>
      `)
      this.chatLog.scrollTop = this.chatLog.scrollHeight
    }
  
    displayMessageFromServer(data) {
      this.chatLog.insertAdjacentHTML('beforeend', `
      <div class="other-chat">
              <div class="msg">
                  <span>${data.username} : </span>
                  <span>${data.message}</span>
              </div>
          </div>
      `)
      this.chatLog.scrollTop = this.chatLog.scrollHeight
    }
  
  }

  window.onload = function () {
    new Chat()
  }