export default class CustomFunctions extends Phaser.Scene {
    constructor() {
      super({ key: 'CustomFunctions' });
      this.scriptId = 'AKfycbw1zakrf0zclJNWzBSXjIKTfudd6Q9-YHNq6EvP7JGQ4OrtPIs0SwrgJCsAyoB4Y5eu'
      this.sheetUrl = `https://script.google.com/macros/s/${this.scriptId}/exec`;
    }
  
    async handleLogin(targetScene, aliasOrEmail, password) {
        
        const inputAliasOrEmail = aliasOrEmail.trim();
        const inputPassword = password.trim();
    
        if (!inputAliasOrEmail || !inputPassword) {
          console.error("Alias/Email and Password are required.");
          return;
        }
    
        try {
          const response = await fetch(
            `${this.sheetUrl}?aliasOrEmail=${inputAliasOrEmail}&password=${inputPassword}`
          );

          const result = await response.json();

          if (result.status === "success") {
            // Player found and authenticated
            const { id, alias } = result.player;
            console.log(`Login successful! Player ID: ${id}, Alias: ${alias}`);
            this.scene.start("GameScene", { playerId: id, alias });
          } else if (result.status === "error" && result.message === "Player not found") {
            // Player doesn't exist, prompt for account creation
            console.log(result.message)
            this.promptAccountCreation(targetScene,inputAliasOrEmail, inputPassword);
          } else {
            console.error(result.message);
          }
        } catch (error) {
          console.error("Error logging in:", error);
        }
    }
    
      promptAccountCreation(targetScene, aliasOrEmail, password) {
        console.log('Prompting player to create an account')
        const isEmail = aliasOrEmail.includes("@");
        console.log('Email entered: ' + isEmail)
    
        targetScene.add.text(200, 450, `Account not found. Create one?`).setInteractive()
          .on('pointerdown', () => this.collectAdditionalInfo(targetScene, aliasOrEmail, password, isEmail));
      }
    
      collectAdditionalInfo(targetScene, aliasOrEmail, password, isEmail) {
        const promptText = isEmail ? "Enter Alias:" : "Enter Email:";
        targetScene.add.text(200, 500, promptText);
        const additionalInput = targetScene.add.dom(200, 550).createElement('input');
        const submitButton = targetScene.add.text(200, 600, "Submit").setInteractive();
    
        submitButton.on('pointerdown', async () => {
          const alias = isEmail ? additionalInput.value.trim() : aliasOrEmail;
          const email = isEmail ? aliasOrEmail : additionalInput.value.trim();
    
          if (!alias || !email) {
            console.error("Alias and Email are required for account creation.");
            return;
          }
    
          try {
            const response = await fetch(
              `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`, {
                method: "POST",
                body: new URLSearchParams({ alias, email, password }),
              }
            );
            const result = await response.json();
    
            if (result.status === "success") {
              const { id, alias } = result.player;
              console.log(`Account created successfully! Player ID: ${id}, Alias: ${alias}`);
              this.scene.start("GameScene", { playerId: id, alias });
            } else {
              console.error(result.message);
            }
          } catch (error) {
            console.error("Error creating account:", error);
          }
        });
      }
    
  }
  