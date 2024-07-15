const emojis = [
    "🤣",
    "😭",
    "😘",
    "🥰",
    "😍",
    "😊",
    "🎉",
    "😁",
    "💕",
    "🥺",
    "😅",
    "🔥",
    "🤦",
    "🤷",
    "🙄",
    "😌",
    "🤩",
    "🙃",
    "😬",
    "😱",
    "😴",
    "🤭",
    "😐",
    "🌞",
    "😇",
    "🌸",
    "😈",
    "🎶",
    "🎊",
    "🥵",
    "😞",
    "💚",
    "🖤",
    "💰",
    "😚",
    "👑",
    "🎁",
    "💥",
  ];
  
  const audioMap = {};
  
  function init() {
    // Make body take up full screen
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.background = "#333333";
  
    // Make center of screen say "Connecting..."
    const connectingText = document.createElement("div");
    connectingText.style.position = "absolute";
    connectingText.style.top = "50%";
    connectingText.style.left = "50%";
    connectingText.style.transform = "translate(-50%, -50%)";
    connectingText.style.color = "#FFFFFF";
    connectingText.style.fontSize = "3rem";
    connectingText.style.fontWeight = "bold";
    connectingText.innerHTML = "Connecting...";
    document.body.appendChild(connectingText);
  
    // Create peer and call main
    const peer = new Peer();
  
    peer.on("open", () => {
      // Remove "Connecting..." text
      document.body.removeChild(connectingText);
  
      // Call main
      main(peer);
    });
  }
  
  function playNote(emojiId, noteId) {
    // Play note
    const audio = audioMap[noteId];
    const newAudio = new Audio(audio.src);
    newAudio.play();
  
    // Play emoji animation on key
    const emoji = emojis[emojiId];
    const emojiDiv = document.createElement("div");
    const buttonDiv = document.getElementById(noteId);
    emojiDiv.style.position = "absolute";
    emojiDiv.style.top = buttonDiv.offsetTop + buttonDiv.offsetHeight / 2 + "px";
    emojiDiv.style.left = buttonDiv.offsetLeft + "px";
    emojiDiv.style.width = buttonDiv.offsetWidth + "px";
    emojiDiv.style.textAlign = "center";
    emojiDiv.style.fontSize = "1.5rem";
    emojiDiv.style.userSelect = "none";
    emojiDiv.style.pointerEvents = "none";
    // fade out font
    emojiDiv.style.transition = "all 0.5s";
    emojiDiv.innerHTML = emoji;
    document.body.appendChild(emojiDiv);
  
    setTimeout(() => {
      emojiDiv.style.opacity = "0";
      emojiDiv.style.transform = "translateY(-100px)";
      setTimeout(() => {
        document.body.removeChild(emojiDiv);
      }, 500);
    }, 100);
  }
  
  function main(peer) {
    // Determine whether we're the host or the client (if no `s` in URL, we're the host)
    const isHost = window.location.href.indexOf("?s") === -1;
  
    // If we're not the host, determine the host's ID from the URL
    const hostId = isHost ? peer.id : window.location.href.split("?s=")[1];
  
    // Split behavior based on whether we're the host or the client
    const connections = new Set();
    if (isHost) {
      peer.on("connection", (conn) => {
        connections.add(conn);
  
        conn.on("data", (data) => {
          // Send data to all other connections
          for (const otherConn of connections) {
            if (otherConn !== conn) {
              otherConn.send(data);
            }
          }
  
          // Parse data
          const [icon, noteId] = data.split(" ");
  
          // Play note
          playNote(icon, noteId);
        });
  
        conn.on("close", () => {
          connections.delete(conn);
        });
      });
    } else {
      const conn = peer.connect(hostId);
      conn.on("open", () => {
        connections.add(conn);
  
        conn.on("data", (data) => {
          // Parse data
          const [icon, noteId] = data.split(" ");
  
          // Play note
          playNote(icon, noteId);
        });
  
        conn.on("close", () => {
          connections.delete(conn);
        });
      });
    }
  
    function playAndSendNote(emojiId, id) {
      playNote(emojiId, id);
  
      // Send note to all connections
      for (const connection of connections) {
        connection.send(emojiId + " " + id);
      }
    }
  
    // Create title bar
    const topBar = document.createElement("div");
    topBar.style.top = "0";
    topBar.style.left = "0";
    topBar.style.width = "100%";
    topBar.style.height = "4rem";
    topBar.style.background = "#444444";
    topBar.style.textAlign = "center";
    document.body.appendChild(topBar);
  
    // Add user icon
    const userIcon = document.createElement("button");
    userIcon.style.position = "absolute";
    userIcon.style.top = "0.5rem";
    userIcon.style.left = "0.5rem";
    userIcon.style.height = "3rem";
    userIcon.style.width = "3rem";
    userIcon.style.background = "#555555";
    userIcon.style.border = "none";
    userIcon.style.borderRadius = "50%";
    userIcon.style.fontSize = "1.5rem";
    userIcon.style.userSelect = "none";
    userIcon.title = "Click to change emoji";
    userIcon.style.cursor = "pointer";
    function randomEmojiId() {
      return Math.floor(Math.random() * emojis.length);
    }
    let emojiId = randomEmojiId();
    userIcon.innerHTML = emojis[emojiId];
    userIcon.onclick = () => {
      emojiId = randomEmojiId();
      userIcon.innerHTML = emojis[emojiId];
    };
    topBar.appendChild(userIcon);
  
    // Add invite button
    const inviteButton = document.createElement("button");
    inviteButton.style.position = "absolute";
    inviteButton.style.top = "0.5rem";
    inviteButton.style.right = "0.5rem";
    inviteButton.style.height = "3rem";
    inviteButton.style.width = "15rem";
    const inviteButtonDefaultColor = "#555555";
    const inviteButtonClickedColor = "#666666";
    inviteButton.style.background = inviteButtonDefaultColor;
    inviteButton.style.color = "#FFFFFF";
    inviteButton.style.border = "none";
    inviteButton.style.borderRadius = "0.5rem";
    inviteButton.style.fontSize = "1.5rem";
    inviteButton.style.fontWeight = "bold";
    inviteButton.style.cursor = "pointer";
    const inviteButtonText = "Invite friends";
    inviteButton.innerHTML = inviteButtonText;
    inviteButton.onclick = () => {
      // Add invite code to clipboard
      const inviteURL = window.location.href.split("?s=")[0] + "?s=" + hostId;
      navigator.clipboard.writeText(inviteURL);
  
      // Change button text until mouse leaves and it's been more than 1/2 second
      inviteButton.innerHTML = "Copied!";
      inviteButton.style.background = inviteButtonClickedColor;
      inviteButton.onmouseleave = () => {
        setTimeout(() => {
          inviteButton.innerHTML = inviteButtonText;
          inviteButton.style.background = inviteButtonDefaultColor;
        }, 500);
      };
    };
    topBar.appendChild(inviteButton);
  
    // Record mouse down
    let isMouseDown = false;
    document.body.onmousedown = () => {
      isMouseDown = true;
    };
    document.body.onmouseup = () => {
      isMouseDown = false;
    };
  
    let offset = 0;
    for (const name of ["brick", "house"]) {
      const button = document.createElement("div");
      button.id = name;
      button.innerHTML = name;
      // center inner html
      button.style.display = "flex";
      button.style.justifyContent = "center";
      button.style.alignItems = "center";
      button.style.position = "absolute";
      button.style.top = "calc(25vh)";
      button.style.height = "calc(min(50vh, 50vw))";
      
      button.style.left = `calc(${25 + offset * 50}% - min(25vh, 25vw))`;
      offset += 1;
      button.style.width = "calc(min(50vh, 50vw))";
      const buttonDefaultColor = "#CC0000";
      const buttonHoverColor = "#AA0000";
      button.style.background = buttonDefaultColor;
      button.style.borderRadius = "50%";
      button.style.boxShadow = "0 0 0.5rem #000000";
      button.style.cursor = "pointer";
      button.style.userSelect = "none";
      button.style.transition = "background 0.1s";
      button.onmouseenter = () => {
        button.style.background = buttonHoverColor;
        if (isMouseDown) {
          playAndSendNote(emojiId, button.id);
        }
      };
      button.onmouseleave = () => {
        button.style.background = buttonDefaultColor;
      };
      button.onmousedown = () => {
        playAndSendNote(emojiId, button.id);
      };
      document.body.appendChild(button);
  
      audioMap[button.id] = new Audio(`./sounds/${button.id}.mp3`);
    }
  
    // Add keyboard controls
    document.onkeydown = (event) => {
        // if B key is pressed
        if (event.key === "b") {
            playAndSendNote(emojiId, "brick");
        }

        // if H key is pressed
        if (event.key === "h") {
            playAndSendNote(emojiId, "house");
        }
    };
  }
  
  init();