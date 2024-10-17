Hooks.once("init", () => {
    console.log("Dice Jail | Initializing Dice Jail Module");

    // Set up the game.diceJail object to hold state and functions
    game.diceJail = {
        lastRolledDice: null,

        // Function to jail the last rolled dice
        jailLastDice: function () {
            console.log("Dice Jail | jailLastDice function triggered");

            if (!this.lastRolledDice || this.lastRolledDice.length === 0) {
                ui.notifications.warn("No dice have been rolled yet!");
                console.log("Dice Jail | No dice have been rolled yet!");
                return;
            }

            // Jail each dice in the last roll
            for (let die of this.lastRolledDice) {
                jailDice(die);
            }
        },

        // Automatically add the macro to the user's hotbar
        setupMacro: async function () {
            const macroName = "Jail Last Dice";
            let macro = game.macros.find((m) => m.name === macroName);
            if (!macro) {
                console.log("Dice Jail | Creating new macro");
                macro = await Macro.create({
                    name: macroName,
                    type: "script",
                    command: "game.diceJail.jailLastDice();",
                    img: "icons/svg/dice-target.svg",
                    scope: "global",
                });
            }

            if (!game.user.getHotbarMacro(1)) {
                console.log("Dice Jail | Assigning macro to hotbar slot 1");
                await game.user.assignHotbarMacro(macro, 1);
            }
        },
    };
});

// Run setup on the 'ready' hook
Hooks.once("ready", async function () {
    if (!game.dice3d) {
        ui.notifications.error(
            "Dice So Nice must be installed to use Dice Jail!"
        );
        console.log("Dice Jail | Dice So Nice module not found");
        return;
    }

    // Set up the dice jail container
    createDiceJailContainer();

    // Set up the macro
    await game.diceJail.setupMacro();
    console.log("Dice Jail | Macro setup completed");
});

// Track the last dice rolled using the chat message hook
Hooks.on("createChatMessage", (message) => {
    // Ensure the message contains roll data
    if (!message.rolls || message.rolls.length === 0) {
        console.log("Dice Jail | No rolls found in the message");
        return;
    }

    // Get the dice rolled in the first roll (if multiple rolls are present)
    const diceResult = message.rolls[0].dice;
    console.log("Dice Jail | Dice rolled:", diceResult);

    if (diceResult.length > 0) {
        game.diceJail.lastRolledDice = diceResult; // Store the dice rolled
        console.log("Dice Jail | Last rolled dice stored");
    }
});

// Function to create the dice jail container if it doesn't exist
function createDiceJailContainer() {
    let jailContainer = document.getElementById("dice-jail");

    // If the container doesn't exist, create it
    if (!jailContainer) {
        console.log("Dice Jail | Creating dice jail container");

        jailContainer = document.createElement("div");
        jailContainer.id = "dice-jail";

        // Add some styling to make it visible
        jailContainer.style.display = "block";
        jailContainer.innerHTML = "<h3>Dice Jail</h3>";

        // Add draggable functionality
        makeDraggable(jailContainer);

        document.body.appendChild(jailContainer);

        console.log("Dice Jail | Dice jail container created and added to DOM");
    }
}

// Function to jail a dice
function jailDice(die) {
    createDiceJailContainer(); // Ensure the container is created before adding dice

    console.log("Dice Jail | Jailing dice: D" + die.faces + ": " + die.total);

    // Create a dice element with styling
    const diceElement = document.createElement("div");
    diceElement.classList.add("jailed-dice");

    // Set the dice content
    diceElement.innerHTML = `D${die.faces}: <strong>${die.total}</strong>`;

    // Append the dice to the jail container
    document.getElementById("dice-jail").appendChild(diceElement);
}


// Function to make an element draggable
function makeDraggable(element) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    element.onmousedown = function (e) {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        // Prevent text selection while dragging
        document.onselectstart = function () { return false; };
        console.log("Dice Jail | Drag started");
    };

    document.onmousemove = function (e) {
        if (isDragging) {
            element.style.left = (e.clientX - offsetX) + 'px';
            element.style.top = (e.clientY - offsetY) + 'px';
        }
    };

    document.onmouseup = function () {
        if (isDragging) {
            isDragging = false;
            // Allow text selection again
            document.onselectstart = null;
            console.log("Dice Jail | Drag ended");
        }
    };
}
