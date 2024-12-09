import { config } from "../config.js";

export default class Login extends Phaser.Scene {
  constructor() {
    super({ key: 'Login' });
    this.scriptId = 'AKfycbw1zakrf0zclJNWzBSXjIKTfudd6Q9-YHNq6EvP7JGQ4OrtPIs0SwrgJCsAyoB4Y5eu'
    this.sheetUrl = `https://script.google.com/macros/s/${this.scriptId}/exec`;
  }

  preload() {
    // Preload assets
  }

  create() {
    
    // Left side: Image and dynamic text
    const leftImage = this.add.image(0, 0, 'story').setOrigin(0).setScale(1).setDisplaySize(config.width, config.height);
    // this.dynamicText = this.add.text(150, 450, 'Dynamic text here', {
    //   fontSize: '16px',
    //   fill: '#fff',
    //   fontFamily: 'Arial',
    //   align: 'center',
    //   wordWrap: { width: 250 },
    // }).setOrigin(0.5);

    // this.updateDynamicText(); // Replace with dynamic logic when needed

    // Right side: Input fields and button
    this.add.text(200, 160, 'Alias/Email', { fontSize: '16px', fill: '#fff', fontFamily: 'Arial' });
    this.aliasOrEmailInput = this.createInputBox(350, 220, false);

    this.add.text(200, 260, 'Password', { fontSize: '16px', fill: '#fff', fontFamily: 'Arial' });
    this.passwordInput = this.createInputBox(350, 320, true);

    this.loginButton = this.add.text(350, 400, 'Login', {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#007bff',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial',
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.handleLogin(this.aliasOrEmailInput.text, this.passwordInput.text));

    this.additionalInput = this.createInputBox(350, 550, false).setVisible(false);

    // Initially set emailInput as active
    this.activeInput = this.aliasOrEmailInput;
    this.setActiveInput(this.aliasOrEmailInput);


    // Keyboard input listener
    this.input.keyboard.on('keydown', (event) => this.handleKeyboardInput(event));
  }

  createInputBox(x, y, isPassword = false) {
    // Create a container for the input box
    const inputBox = this.add.rectangle(x, y, 300, 50, 0x222222, 0.8).setStrokeStyle(2, 0xffffff).setOrigin(0.5);
    const text = this.add.text(x - 140, y - 15, '', { fontSize: '18px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0);
  
    inputBox.text = ''; // Store the current input
    inputBox.isPassword = isPassword;
  
    // Enable clicking on the input box to activate it
    inputBox.setInteractive().on('pointerdown', () => {
      this.setActiveInput(inputBox);
    });
  
    // Add a blinking cursor
    inputBox.cursor = '|';
    const cursorBlink = this.time.addEvent({
      delay: 500,
      callback: () => {
        inputBox.cursor = inputBox.cursor === '|' ? '' : '|';
        if (this.activeInput === inputBox) {
          const displayText = inputBox.isPassword
            ? '*'.repeat(inputBox.text.length)
            : inputBox.text;
          text.setText(displayText + inputBox.cursor);
        }
      },
      loop: true,
    });
  
    inputBox.textObject = text; // Link the text object to the input box

    return inputBox;
  }


  async handleLogin(aliasOrEmail, password) {
        
    const inputAliasOrEmail = aliasOrEmail.trim();
    const inputPassword = password.trim();

    if (!inputAliasOrEmail || !inputPassword) {
      console.error("Alias/Email and Password are required.");
      return;
    }

    try {
      const response = await fetch(
        `${this.sheetUrl}?request=playerLogin&aliasOrEmail=${inputAliasOrEmail}&password=${inputPassword}`,{
          method: "POST",
        }
      );

      const result = await response.json();

      console.log(result)

      if (result.status === "success") {
        // Player found and authenticated
        const { id, alias } = result.player;
        console.log(`Login successful! Player ID: ${id}, Alias: ${alias}`);
        console.log(result.player);
        this.scene.start("Base", { dataPacket: result.player});
      } else if (result.status === "error" && result.message === "Player not found") {
        // Player doesn't exist, prompt for account creation
        console.log(result.message)
        this.promptAccountCreation(inputAliasOrEmail, inputPassword);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
}

  promptAccountCreation(aliasOrEmail, password) {
    console.log('Prompting player to create an account')
    const isEmail = aliasOrEmail.includes("@");
    console.log('Email entered: ' + isEmail)

    this.add.text(200, 450, `Account not found. Create one?`).setInteractive()
      .on('pointerdown', () => this.collectAdditionalInfo(aliasOrEmail, password, isEmail));
  }

  collectAdditionalInfo(aliasOrEmail, password, isEmail) {
    this.additionalInput.setVisible(true)

    const promptText = isEmail ? "Enter Alias:" : "Enter Email:";
    this.add.text(200, 500, promptText);
    const submitButton = this.add.text(350, 600, "Submit",{
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#007bff',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial',
    }).setOrigin(0.5)
      .setInteractive()

    submitButton.on('pointerdown', async () => {
      const alias = isEmail ? this.additionalInput.text.trim() : aliasOrEmail;
      const email = isEmail ? aliasOrEmail : this.additionalInput.text.trim();


      if (!alias || !email) {
        console.error("Alias and Email are required for account creation.");
        return;
      }


      try {
        const response = await fetch(
          `${this.sheetUrl}?request=addPlayer&alias=${alias}&email=${email}&password=${password}`,{
            method: "POST",
          }
        );
      
        const result = await response.json();

        if (result.status === "success") {
          const { id, alias } = result.player;
          console.log(`Account created successfully! Player ID: ${id}, Alias: ${alias}`);
          this.scene.start("Base", { dataPacket: result.player} );
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error("Error creating account:", error);
      }
    });
  }



  setActiveInput(inputBox) {
    // Update the active input box
    if (this.activeInput) {
      this.activeInput.setStrokeStyle(2, 0xffffff); // Reset outline of previous box
    }
    this.activeInput = inputBox;
    this.activeInput.setStrokeStyle(4, 0x00ff00); // Highlight active box

    
  }


  handleKeyboardInput(event) {
    // Ensure we only handle input for the active input box
    if (!this.activeInput) return;
  
    const inputBox = this.activeInput;
  
    if (event.key === 'Backspace') {
      inputBox.text = inputBox.text.slice(0, -1); // Remove last character
    } else if (event.key.length === 1 && inputBox.text.length < 20) {
      inputBox.text += event.key; // Add typed character
  
      if (inputBox.isPassword) {
        // Temporarily show the last typed character
        const currentText = inputBox.text;
        inputBox.textObject.setText(currentText + inputBox.cursor);
  
        // Mask the character after a short delay
        this.time.delayedCall(750, () => {
          if (inputBox.text === currentText && this.activeInput === inputBox) {
            inputBox.textObject.setText('*'.repeat(inputBox.text.length) + inputBox.cursor);
          }
        });
      }
    }
  
    if (!inputBox.isPassword) {
      // Regular input field
      inputBox.textObject.setText(inputBox.text + inputBox.cursor);
    }
  }
  


  // Hash the password using SHA-256 and return the hashed result
// async hashPassword(password) {
//   // Convert password string to a Uint8Array
//   const encoder = new TextEncoder();
//   const data = encoder.encode(password);

//   // Hash the password using SHA-256
//   const hashBuffer = await crypto.subtle.digest('SHA-256', data);

//   // Convert the hash buffer into a hexadecimal string
//   const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
//   const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

//   return hashHex; // Return the hashed password as a hex string
// }

  // updateButtonState() {
  //   this.loginButton.setText(this.isNewAccount ? 'Create Account' : 'Login');
  // }

  clearMessages() {
    if (this.errorText) {
      this.errorText.destroy();
      this.errorText = null;
    }
    if (this.welcomeText) {
      this.welcomeText.destroy();
      this.welcomeText = null;
    }

    if (this.newAccountText) {
      this.newAccountText.destroy();
      this.newAccountText = null;
    }
  }

  showError(message) {
    // Clear any existing error message
      // Clear existing messages
      this.clearMessages();

    const errorText = this.add.text(400, 500, message, {
      fontSize: '16px',
      fill: '#f00',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setAlpha(0); // Start fully transparent
  
    // Fade in the error text
    this.tweens.add({
      targets: errorText,
      alpha: { from: 0, to: 1 },
      duration: 500, // 500ms fade-in duration
    });

    // Assign the new error text for future reference
    this.errorText = errorText;
  }

  showWelcomeMessage(alias) {
    // Clear existing messages
    this.clearMessages();

    const welcome = this.add.text(400, 500, `Welcome back, ${alias}!`, {
      fontSize: '16px',
      fill: '#0f0',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: welcome,
      alpha: { from: 0, to: 1 },
      duration: 500,
    });

    this.welcomeText = welcome
  }

  showNewAccountMessage(alias) {
    // Clear existing messages
    this.clearMessages();

    const newAccount = this.add.text(400, 500, `Creating account for ${alias}...`, {
      fontSize: '16px',
      fill: '#0f0',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: newAccount,
      alpha: { from: 0, to: 1 },
      duration: 500,
    });

    this.newAccountText = newAccount
  }

  // updateDynamicText() {
  //   // Placeholder for dynamic text logic
  //   const randomTexts = ['Welcome to the Badlands!', 'Explore the unknown.', 'Ready for adventure?'];
  //   this.dynamicText.setText(randomTexts[Math.floor(Math.random() * randomTexts.length)]);
  // }
}
