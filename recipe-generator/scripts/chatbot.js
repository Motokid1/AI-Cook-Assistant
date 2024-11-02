// scripts/chatbot.js
class Chatbot {
  constructor() {
    this.chatWindow = document.getElementById("chatWindow");
    this.chatInput = document.getElementById("chatInput");
    this.chatSendButton = document.getElementById("chatSendButton");
    this.recipeGenerator = new RecipeGenerator(this);
    this.bindEvents();
  }

  bindEvents() {
    this.chatSendButton.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
  }

  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;
    this.appendMessage("You", message, "user-message");
    this.chatInput.value = "";
    this.processMessage(message);
  }

  appendMessage(sender, message, className) {
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${className}`;
    messageElement.innerHTML = `<strong>${sender}:</strong> ${this.formatMessage(
      message
    )}`;
    this.chatWindow.appendChild(messageElement);
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }

  formatMessage(message) {
    // Convert newlines to <br> and add basic formatting
    return message.replace(/\n/g, "<br>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  async processMessage(userMessage) {
    try {
      // Normalize message
      const normalizedMessage = userMessage.toLowerCase();

      // Check for specific intents
      if (this.isRecipeRequest(normalizedMessage)) {
        await this.handleRecipeRequest(userMessage);
      } else if (this.isCookingTipRequest(normalizedMessage)) {
        this.handleCookingTip(userMessage);
      } else if (this.isIngredientInfoRequest(normalizedMessage)) {
        await this.handleIngredientInfo(userMessage);
      } else if (this.isCookingTechniqueRequest(normalizedMessage)) {
        await this.handleCookingTechnique(userMessage);
      } else {
        // Default fallback response
        this.getBotResponse(userMessage);
      }
    } catch (error) {
      this.appendMessage(
        "Bot",
        "Sorry, I encountered an error. Please try again.",
        "bot-message"
      );
      console.error(error);
    }
  }

  // Intent Recognition Methods
  isRecipeRequest(message) {
    const recipeKeywords = [
      "recipe",
      "cook",
      "make",
      "create a dish",
      "what can i make with",
      "cooking suggestion",
      "how to make",
      "dinner idea",
      "lunch recipe",
    ];
    return recipeKeywords.some((keyword) => message.includes(keyword));
  }

  isCookingTipRequest(message) {
    const tipKeywords = [
      "cooking tip",
      "kitchen hack",
      "advice",
      "how to cook",
      "cooking technique",
    ];
    return tipKeywords.some((keyword) => message.includes(keyword));
  }

  isIngredientInfoRequest(message) {
    const ingredientKeywords = [
      "about",
      "tell me about",
      "information on",
      "how to use",
      "what is",
    ];
    return ingredientKeywords.some(
      (keyword) =>
        message.includes(keyword) &&
        (message.includes("ingredient") ||
          message.includes("food") ||
          message.includes("spice"))
    );
  }

  isCookingTechniqueRequest(message) {
    const techniqueKeywords = [
      "how to",
      "technique",
      "method",
      "best way to",
      "proper way",
    ];
    return techniqueKeywords.some(
      (keyword) =>
        message.includes(keyword) &&
        (message.includes("chop") ||
          message.includes("slice") ||
          message.includes("cook") ||
          message.includes("bake") ||
          message.includes("fry"))
    );
  }
  // Update the handleRecipeRequest method in the Chatbot class
  async handleRecipeRequest(userMessage) {
    // Extract main ingredients
    const ingredientsMatch =
      userMessage.match(/with\s+(.*)/i) ||
      userMessage.match(/\b(chicken|beef|fish|vegetables|pasta|rice)\b/i);
    const ingredients = ingredientsMatch
      ? ingredientsMatch[1].split(",").map((ing) => ing.trim())
      : [];

    // Extract ingredient exclusions
    const excludeMatch = userMessage.match(/no\s+(.*)/i);
    const excludedIngredients = excludeMatch
      ? excludeMatch[1].split(",").map((ing) => ing.trim())
      : [];

    // Check for dietary restrictions
    const dietaryRestrictions = [
      "vegan",
      "vegetarian",
      "gluten-free",
      "dairy-free",
      "low-carb",
      "keto",
    ].find((diet) => userMessage.toLowerCase().includes(diet));

    // Show loading indicator
    this.appendMessage(
      "Bot",
      "Generating recipe... Please wait.",
      "bot-message"
    );

    try {
      // Prepare prompt with ingredient preferences and exclusions
      let recipePrompt =
        ingredients.length > 0
          ? `Create a recipe featuring ${ingredients.join(", ")}`
          : "Create an interesting recipe";

      if (excludedIngredients.length > 0) {
        recipePrompt += ` that does NOT include ${excludedIngredients.join(
          ", "
        )}`;
      }

      if (dietaryRestrictions) {
        recipePrompt += `. Ensure the recipe is ${dietaryRestrictions}`;
      }

      // Generate recipe
      const recipeText = await this.recipeGenerator.generateRecipe(
        recipePrompt,
        dietaryRestrictions
      );

      // Parse recipe sections
      const parsedRecipe = this.recipeGenerator.parseRecipeSections(recipeText);

      // Validate recipe against preferences
      const validationResult = this.validateRecipe(
        parsedRecipe,
        ingredients,
        excludedIngredients,
        dietaryRestrictions
      );

      // Format recipe for display
      let formattedRecipe = validationResult.isValid
        ? this.formatRecipeForDisplay(parsedRecipe)
        : this.generateAlternativeRecipeMessage(validationResult);

      this.appendMessage("Bot", formattedRecipe, "bot-message");
    } catch (error) {
      this.appendMessage(
        "Bot",
        `Sorry, I couldn't generate a recipe. Error: ${error.message}`,
        "bot-message"
      );
      console.error(error);
    }
  }

  // New method to validate recipe against preferences
  validateRecipe(
    recipe,
    requiredIngredients,
    excludedIngredients,
    dietaryRestriction
  ) {
    const validation = {
      isValid: true,
      issues: [],
    };

    // Check required ingredients
    if (requiredIngredients.length > 0) {
      const missingIngredients = requiredIngredients.filter(
        (req) =>
          !recipe.ingredients.some((ing) =>
            ing.toLowerCase().includes(req.toLowerCase())
          )
      );

      if (missingIngredients.length > 0) {
        validation.isValid = false;
        validation.issues.push(
          `Missing required ingredients: ${missingIngredients.join(", ")}`
        );
      }
    }

    // Check excluded ingredients
    if (excludedIngredients.length > 0) {
      const foundExcludedIngredients = excludedIngredients.filter((exc) =>
        recipe.ingredients.some((ing) =>
          ing.toLowerCase().includes(exc.toLowerCase())
        )
      );

      if (foundExcludedIngredients.length > 0) {
        validation.isValid = false;
        validation.issues.push(
          `Contains excluded ingredients: ${foundExcludedIngredients.join(
            ", "
          )}`
        );
      }
    }

    // Check dietary restrictions
    if (dietaryRestriction) {
      const dietViolations = this.checkDietaryRestrictions(
        recipe,
        dietaryRestriction
      );
      if (dietViolations.length > 0) {
        validation.isValid = false;
        validation.issues.push(
          `Dietary restriction violations: ${dietViolations.join(", ")}`
        );
      }
    }

    return validation;
  }

  // Helper method to check dietary restrictions
  checkDietaryRestrictions(recipe, dietaryRestriction) {
    const violations = [];
    const ingredients = recipe.ingredients.map((ing) => ing.toLowerCase());

    switch (dietaryRestriction) {
      case "vegan":
        const animalProducts = [
          "egg",
          "milk",
          "cheese",
          "butter",
          "cream",
          "meat",
          "chicken",
          "fish",
          "beef",
          "pork",
        ];
        const veganViolations = animalProducts.filter((product) =>
          ingredients.some((ing) => ing.includes(product))
        );
        violations.push(...veganViolations);
        break;

      case "vegetarian":
        const meatProducts = ["meat", "chicken", "fish", "beef", "pork"];
        const vegetarianViolations = meatProducts.filter((product) =>
          ingredients.some((ing) => ing.includes(product))
        );
        violations.push(...vegetarianViolations);
        break;

      case "gluten-free":
        const glutenSources = [
          "wheat",
          "flour",
          "bread",
          "pasta",
          "couscous",
          "semolina",
        ];
        const glutenViolations = glutenSources.filter((source) =>
          ingredients.some((ing) => ing.includes(source))
        );
        violations.push(...glutenViolations);
        break;

      case "dairy-free":
        const dairyProducts = ["milk", "cheese", "butter", "cream", "yogurt"];
        const dairyViolations = dairyProducts.filter((product) =>
          ingredients.some((ing) => ing.includes(product))
        );
        violations.push(...dairyViolations);
        break;
    }

    return violations;
  }

  // Method to generate alternative recipe message
  generateAlternativeRecipeMessage(validationResult) {
    let message = "*Recipe Adjustment Needed*\n\n";
    message += "I found some issues with the generated recipe:\n";

    validationResult.issues.forEach((issue) => {
      message += `• ${issue}\n`;
    });

    message +=
      "\n*Recommendation:* Please provide more specific ingredients or try a different recipe request.";

    return message;
  }

  // Helper method to format recipe for display (same as before)
  formatRecipeForDisplay(parsedRecipe) {
    let formattedRecipe = `*${parsedRecipe.title || "Delicious Recipe"}*\n\n`;

    // Ingredients section
    formattedRecipe += "*Ingredients:*\n";
    (parsedRecipe.ingredients.length > 0
      ? parsedRecipe.ingredients
      : ["No ingredients specified"]
    ).forEach((ing) => {
      formattedRecipe += `• ${ing}\n`;
    });

    // Instructions section
    formattedRecipe += "\n*Instructions:*\n";
    (parsedRecipe.instructions.length > 0
      ? parsedRecipe.instructions
      : ["No instructions provided"]
    ).forEach((step, index) => {
      formattedRecipe += `${index + 1}. ${step}\n`;
    });

    // Tips section
    if (parsedRecipe.tips.length > 0) {
      formattedRecipe += "\n*Tips:*\n";
      parsedRecipe.tips.forEach((tip) => {
        formattedRecipe += `• ${tip}\n`;
      });
    }

    return formattedRecipe;
  }

  handleCookingTip(userMessage) {
    const cookingTips = [
      "Always preheat your oven before baking.",
      "Use sharp knives for safer and more precise cutting.",
      "Let meat rest after cooking to retain juices.",
      "Season your food in layers for more depth of flavor.",
      "Use a meat thermometer to check doneness accurately.",
      "Keep your workspace clean and organized while cooking.",
      "Taste your food as you cook and adjust seasoning.",
      "Rest pasta in hot water for a minute after draining to prevent sticking.",
    ];

    const randomTip =
      cookingTips[Math.floor(Math.random() * cookingTips.length)];
    this.appendMessage("Bot", `*Cooking Tip:* ${randomTip}`, "bot-message");
  }

  async handleIngredientInfo(userMessage) {
    // Extract ingredient name
    const ingredientMatch = userMessage.match(
      /\b(chicken|beef|fish|tomato|onion|garlic|potato|carrot)\b/i
    );
    const ingredient = ingredientMatch ? ingredientMatch[1] : null;

    if (!ingredient) {
      this.appendMessage(
        "Bot",
        "I'm sorry, I couldn't identify a specific ingredient in your query.",
        "bot-message"
      );
      return;
    }

    try {
      const ingredientInfo = await this.recipeGenerator.generateIngredientInfo(
        ingredient
      );
      this.appendMessage("Bot", ingredientInfo, "bot-message");
    } catch (error) {
      this.appendMessage(
        "Bot",
        `Sorry, I couldn't find information about ${ingredient}. Error: ${error.message}`,
        "bot-message"
      );
    }
  }

  async handleCookingTechnique(userMessage) {
    // Extract technique
    const techniqueMatch = userMessage.match(
      /\b(chop|slice|dice|mince|bake|fry|grill|roast)\b/i
    );
    const technique = techniqueMatch ? techniqueMatch[1] : null;

    if (!technique) {
      this.appendMessage(
        "Bot",
        "I'm sorry, I couldn't identify a specific cooking technique in your query.",
        "bot-message"
      );
      return;
    }

    try {
      const techniqueInfo =
        await this.recipeGenerator.generateCookingTechniqueInfo(technique);
      this.appendMessage("Bot", techniqueInfo, "bot-message");
    } catch (error) {
      this.appendMessage(
        "Bot",
        `Sorry, I couldn't find information about the ${technique} technique. Error: ${error.message}`,
        "bot-message"
      );
    }
  }

  getBotResponse(userMessage) {
    const genericResponses = [
      "I'm your cooking assistant! Ask me about recipes, ingredients, or cooking techniques.",
      "Need help in the kitchen? I can suggest recipes, provide cooking tips, or explain ingredients.",
      "Feeling hungry? I can help you find a delicious recipe or cooking advice!",
      "From recipe ideas to cooking techniques, I'm here to help you create amazing meals.",
    ];

    const randomResponse =
      genericResponses[Math.floor(Math.random() * genericResponses.length)];
    this.appendMessage("Bot", randomResponse, "bot-message");
  }
}

class RecipeGenerator {
  constructor(uiHandler) {
    this.uiHandler = uiHandler;
  }

  async generateRecipe(ingredients, dietary) {
    const apiKey = "YOUR_API_KEY"; // Replace with your actual API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    let prompt = `Create a detailed and creative recipe. `;

    if (ingredients && ingredients !== "interesting") {
      prompt += `Use these specific ingredients: ${ingredients}. `;
    }

    if (dietary) {
      prompt += `Ensure the recipe is ${dietary}. `;
    }

    prompt += `
    Format the response with clear sections:
    Title: [Creative Recipe Name]
    Ingredients:
    • List all ingredients with precise measurements
    Instructions:
    1. Detailed, step-by-step cooking instructions
    Tips:
    • Helpful cooking advice or recipe variations
    
    Make the recipe engaging, easy to follow, and delicious.`;

    const requestData = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Recipe Generation Error:", error);
      throw error;
    }
  }

  async generateIngredientInfo(ingredient) {
    const apiKey = "AIzaSyAOtfhqAqEkUOj8jjaYGQF0AzkEWzODY2U"; // Replace with your actual API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const prompt = `Provide comprehensive information about ${ingredient}:
    • Culinary uses
    • Nutritional benefits
    • Interesting cooking tips
    • How to select and store
    • A quick, simple recipe idea featuring this ingredient`;

    const requestData = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 512,
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Ingredient Info Error:", error);
      throw error;
    }
  }

  async generateCookingTechniqueInfo(technique) {
    const apiKey = "AIzaSyAOtfhqAqEkUOj8jjaYGQF0AzkEWzODY2U"; // Replace with your actual API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const prompt = `Explain the ${technique} cooking technique in detail:
    • What is the ${technique} technique?
    • Step-by-step how to perform this technique
    • Best foods to use this technique with
    • Common mistakes to avoid
    • Pro tips for mastering this technique`;

    const requestData = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 512,
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Cooking Technique Info Error:", error);
      throw error;
    }
  }

  parseRecipeSections(text) {
    const sections = {
      title: "",
      ingredients: [],
      instructions: [],
      tips: [],
    };

    const lines = text.split("\n");
    let currentSection = "";

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      if (line.toLowerCase().includes("title:")) {
        sections.title = line.split(":")[1].trim();
      } else if (line.toLowerCase().includes("ingredients:")) {
        currentSection = "ingredients";
      } else if (line.toLowerCase().includes("instructions:")) {
        currentSection = "instructions";
      } else if (line.toLowerCase().includes("tips:")) {
        currentSection = "tips";
      } else if (currentSection && line.match(/^[-•*\d]/)) {
        sections[currentSection].push(line.replace(/^[-•*\d]+\s*/, ""));
      } else if (currentSection) {
        sections[currentSection].push(line);
      }
    });

    return sections;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Chatbot();
});

// histroy fuctionality
// chatbot.js

document
  .getElementById("sendButton")
  .addEventListener("click", async function () {
    const userMessage = document.getElementById("userMessage").value.trim();
    if (!userMessage) return;

    // Append user message to chat
    // ... (existing code to display userMessage in UI)

    try {
      const response = await fetch(/* Chatbot API URL and configuration */);
      const botReply = await response.json();
      // Display bot reply
      // ... (existing code to display botReply in UI)

      // Save conversation to history
      HistoryManager.saveHistory(
        "chatbot",
        `User: ${userMessage} - Bot: ${botReply.text}`
      );
    } catch (error) {
      console.error("Error:", error);
    }
  });
