import { config } from "../config.js";

export default class Login extends Phaser.Scene {
  constructor() {
    super({ key: 'Login' });
  }

  preload() {
    // Preload assets
  }

  create() {
    this.playerData = {}

    this.fetchPlayerData().then(fetchedData  => {
      this.playerData = fetchedData
      console.log(this.playerData); // Log the player data for debugging

    });
    
    // Left side: Image and dynamic text
    //const leftImage = this.add.image(150, 300, 'story').setOrigin(0).setScale(0.25);
    const leftImage = this.add.image(0, 0, 'story').setOrigin(0).setScale(1).setDisplaySize(config.width, config.height);
    this.dynamicText = this.add.text(150, 450, 'Dynamic text here', {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 250 },
    }).setOrigin(0.5);

    this.updateDynamicText(); // Replace with dynamic logic when needed

    // Right side: Input fields and button
    this.add.text(200, 160, 'Alias', { fontSize: '16px', fill: '#fff', fontFamily: 'Arial' });
    this.aliasInput = this.createInputBox(350, 220, false);

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
      .on('pointerdown', () => this.handleSubmit());


    this.isNewAccount = false; // Default state for the button
    this.updateButtonState();  // Ensure the initial button text reflects this

    // Initially set emailInput as active
    this.activeInput = this.aliasInput;
    this.setActiveInput(this.aliasInput);


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

  update() {
    this.validateAlias()
  }

  // Function to fetch player data (for login validation)
  async fetchPlayerData() {
  const sheetId = '14nypZw51wjrP9cboBZEOTT8GdI3XeP29opyj0dZHEsY'; // Replace with your actual Google Sheet ID
  const range = 'Players!A2:E'; // Adjust to the range in your Google Sheet (Player ID, Username, Password)
  const apiKey = 'AIzaSyCSVF9-wWYsLxby4RcZ_DRS8spw5l0KrdM'

  const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;  // Replace YOUR_API_KEY with your Google API key

  try {
    // Wait for the fetch call to complete
    const response = await fetch(sheetUrl);
    
    // Check if the response is OK (status code 200)
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Parse the response as JSON
    const data = await response.json();

    // Log the parsed data for debugging
    console.log('Parsed API data:', data);

    const playerData = {};
    
    // Process the data to create player objects
    data.values.forEach(row => {
      const playerId = row[0];   // Player ID (e.g., '1')
      const alias = row[1];      // Alias (e.g., 'alice')
      const password = row[2];   // Password (e.g., 'hashed1')

      // Populate playerData with a structure compatible with your game
      playerData[playerId] = {
        alias: alias,
        password: password
      };
    });

    return playerData; // Return the formatted player data

  } catch (error) {
    console.error('Error fetching player data:', error);
    throw error; // Propagate the error to be handled by the caller (handleSubmit)
  }
  }

  // Function to submit player data to Google Form
  async submitPlayerData(id, alias, password, email) {
  const formID = 'AKfycbw1zakrf0zclJNWzBSXjIKTfudd6Q9-YHNq6EvP7JGQ4OrtPIs0SwrgJCsAyoB4Y5eu'
  const formUrl = `https://script.google.com/macros/s/${formID}/exec`; // Replace with your form's URL


  const formData = new FormData();
  // Only append the value if it's not null or empty

  //if (id && id.trim()) {
    formData.append('id', id);  // Entry ID for Alias
  //}

  if (alias && alias.trim()) {
    formData.append('alias', alias);  // Entry ID for Alias
  }

  if (password && password.trim()) {
    formData.append('password', password);  // Entry ID for Password
  }

  if (email && email.trim()) {
    formData.append('email', email);  // Entry ID for Email
  }

  // Submit the form data using POST
  try {
    const response = await fetch(formUrl, {
      method: 'POST',
      body: formData,
      //mode: 'no-cors'
    });

    const data = await response.json();
    if (data.status === 'success') {
      console.log('Player added successfully:', data.message);
      //return data; // Return the success message or any relevant data
    } else {
      console.error('Error:', data.message);
     // throw new Error(data.message); // Throw error if submission fails
    }
  } catch (error) {
    console.error('Error submitting data:', error);
    //throw error; // Propagate the error to be handled in handleSubmit
  }
}

  findPlayerByAlias(input) {
    for (const playerId in this.playerData) {
      const player = this.playerData[playerId];
      if (player.alias === input) {
        return player; // Return the matched player object
      }
    }
    return null; // No match found
  }

  validateAlias() {
    const currentAlias = this.aliasInput.text.trim();
    const matchingPlayer = this.findPlayerByAlias(currentAlias);

    if (matchingPlayer) {
      // Existing account: Set button to Login
      if (this.isNewAccount) {
        this.isNewAccount = false;
        this.updateButtonState();
      }
    } else {
      // New account: Set button to Create Account
      if (!this.isNewAccount) {
        this.isNewAccount = true;
        this.updateButtonState();
      }
    }
  
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
  

  async handleSubmit() {
    const alias = this.aliasInput.text.trim();
    const password = this.passwordInput.text.trim();

    if (!alias || !password) {
      this.showError('Both fields are required!');
      return;
    }

    // Hash the entered password before checking it
    const hashedPassword = await this.hashPassword(password);

    const matchingPlayer = this.findPlayerByAlias(alias);

    if (matchingPlayer) {
      // Existing account: Validate password
      if (matchingPlayer.password === hashedPassword) {
        this.showWelcomeMessage(matchingPlayer.alias);
        //this.scene.start('PlayerDashboardScene', { playerData: matchingPlayer });
        this.scene.start('Base', { playerData: matchingPlayer });
      } else {
        this.showError('Invalid password. Please try again.');
      }
    } else {
      // New account: Create player data
      //const newPlayerId = `player${Object.keys(this.playerData).length + 1}`;

      const newPlayerId = Object.keys(this.playerData).length + 1;

      try {
        // Step 1: Submit the new player data
        await this.submitPlayerData(newPlayerId, alias, hashedPassword);

       await this.fetchPlayerData().then(fetchedData  => {
          this.playerData = fetchedData
          console.log(this.playerData); // Log the player data for debugging
    
        });

  
        // Step 4: Start the next scene or redirect to player dashboard
        this.scene.start('Base', { playerData: this.playerData[newPlayerId] });
  
      } catch (error) {
        console.error('Error during player account creation:', error);
        // Optionally, show an error message to the user
      }
    }
  }

  // Hash the password using SHA-256 and return the hashed result
async hashPassword(password) {
  // Convert password string to a Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Hash the password using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash buffer into a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  return hashHex; // Return the hashed password as a hex string
}

  updateButtonState() {
    this.loginButton.setText(this.isNewAccount ? 'Create Account' : 'Login');
  }

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

  showAccountCreationMessage(alias) {
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

  updateDynamicText() {
    // Placeholder for dynamic text logic
    const randomTexts = ['Welcome to the Badlands!', 'Explore the unknown.', 'Ready for adventure?'];
    this.dynamicText.setText(randomTexts[Math.floor(Math.random() * randomTexts.length)]);
  }
}
