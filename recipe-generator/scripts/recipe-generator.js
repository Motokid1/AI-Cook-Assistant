class RecipeGenerator {
  constructor(uiHandler) {
    this.uiHandler = uiHandler;
  }

  async generateRecipe(ingredients, dietary) {
    const apiKey = "AIzaSyAOtfhqAqEkUOj8jjaYGQF0AzkEWzODY2U";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    let prompt = `Create a detailed recipe using these ingredients: ${ingredients}.`;
    if (dietary) {
      prompt += ` The recipe should be ${dietary}.`;
    }
    prompt += ` Format the response with clear sections for 'Title', 'Ingredients', 'Instructions', and 'Tips'. Make it easy to read and follow.`;

    const data = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new Error("Failed to generate recipe");
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
      } else if (currentSection && line.match(/^[-•*]/)) {
        sections[currentSection].push(line.replace(/^[-•*]\s*/, ""));
      } else if (currentSection && line.match(/^\d+\./)) {
        sections[currentSection].push(line.replace(/^\d+\.\s*/, ""));
      } else if (currentSection) {
        sections[currentSection].push(line);
      }
    });

    return sections;
  }
}

// histroy functionality
// recipe_generator.js

document
  .getElementById("generateRecipeButton")
  .addEventListener("click", async function () {
    const ingredients = document
      .getElementById("ingredientsInput")
      .value.trim();
    if (!ingredients) return;

    // Show loading indication
    // ...

    try {
      const response = await fetch(/* Recipe API URL and configuration */);
      const recipe = await response.json();
      // Display recipe
      // ... (existing code to display recipe)

      // Save recipe to history
      HistoryManager.saveHistory(
        "recipeGenerator",
        `Ingredients: ${ingredients} - Recipe: ${recipe.details}`
      );
    } catch (error) {
      console.error("Error:", error);
    }
  });
