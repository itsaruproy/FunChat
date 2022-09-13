class Chat {
    constructor() {
      this.socket = null
      this.openedYet = false
      this.chatName = ""
      this.typingTimeout = null
      this.amTyping = false
      this.modal = document.querySelector("#modal")
      this.app = document.querySelector("#app")
      this.userCount = document.querySelector("#userCount")
      this.chatField = document.querySelector("#chatMessage")
      this.chatLog = document.querySelector("#chatLog")
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
        this.modal.classList.remove("active")
        this.app.classList.remove("hide")
      })
  
      this.socket.on('nickExisted', () => {
        console.log("nickname existed")
        this.alreadyExistedName.classList.remove("hide")
      })
  
      this.socket.on('system', (data) => {
          let txt = data.type === 'login' ? 'joined' : 'left'
          this.userCount.textContent = data.total
          this.displaySystemMessage({username: data.nickname, message: txt})
      })

      this.socket.on('displayTyping', () => {
        this.displayTypingAnimation()
      })

      this.socket.on('removeTyping', () => {
        this.removeTypingAnimation()
      })

      this.chatField.addEventListener('keypress', () => {
        if(!this.amTyping) {
          this.socket.emit('typing')
          this.amTyping = true
        }
        if(this.typingTimeout) {
          clearTimeout(this.typingTimeout)
        }
        this.typingTimeout = setTimeout(() => {
          this.amTyping = false
          this.socket.emit('typingStop')
        }, 2000)
      })
    }
  
    // Methods
    

    sendMessageToServer() {
      this.socket.emit('chatMessageFromBrowser', {message: this.chatField.value, username: this.chatName})
      this.chatLog.insertAdjacentHTML('beforeend',`
          <div class="app__chat-sent">
              <div class="app__chat-msg">
                  <span class="app__chat-msgname">${this.chatName}</span>
                  <span class="app__chat-msgtext">${this.chatField.value}</span>
              </div>
          </div>
      `)
      this.chatLog.scrollTop = this.chatLog.scrollHeight
      this.chatField.value = ''
      this.chatField.focus()
    }
  
    hideModal() {
      this.modal.classList.remove("active")
    }
  
    showChat() {
      if (!this.openedYet) {
        this.openConnection()
      }
      this.openedYet = true
      this.modal.classList.add("active")
      this.nickNameSelector.focus()
    }
  
    openConnection() {
      this.socket.on('chatMessageFromServer', (data) => {
        this.displayMessageFromServer(data)
      })
    }
  
    displaySystemMessage(data) {
      this.chatLog.insertAdjacentHTML('beforeend', `
                <div class="app__chat-system">
                    <div class="app__chat-msg">
                        <span class="app__chat-msgtext">${data.username} ${data.message}</span>
                    </div>
                </div>
      `)
      this.chatLog.scrollTop = this.chatLog.scrollHeight
    }
  
    displayMessageFromServer(data) {
      this.chatLog.insertAdjacentHTML('beforeend', `
                <div class="app__chat-recv">
                    <div class="app__chat-msg">
                        <span class="app__chat-msgname">${data.username}</span>
                        <span class="app__chat-msgtext">${data.message}</span>
                    </div>
                </div>
      `)
      this.chatLog.scrollTop = this.chatLog.scrollHeight
    }

    displayTypingAnimation() {
      this.chatLog.insertAdjacentHTML('beforeend', `
        <div class="app__chat-typing">
          <div class="app__chat-dots">
              <span class="app__chat-dot one"></span>
              <span class="app__chat-dot two"></span>
              <span class="app__chat-dot three"></span>
          </div>
        </div>
      
      `)

      this.chatLog.scrollTop = this.chatLog.scrollHeight
    }

    removeTypingAnimation() {
        this.animationWrapper = document.querySelector(".app__chat-typing")
        this.animationWrapper.remove()
        this.chatLog.scrollTop = this.chatLog.scrollHeight
    }
  
  }

  window.onload = function () {
    new Chat()
  }