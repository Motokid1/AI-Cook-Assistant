class UIHandler {
  constructor() {
    this.generateButton = document.getElementById("generateButton");
    this.ingredientsInput = document.getElementById("ingredients");
    this.dietarySelect = document.getElementById("dietary");
    this.recipeDisplay = document.getElementById("recipeDisplay");
    this.loader = document.getElementById("loader");
    this.errorMessage = document.getElementById("errorMessage");
  }

  bindGenerateEvent(callback) {
    this.generateButton.addEventListener("click", callback);
    this.ingredientsInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") callback();
    });
  }

  showLoading(show) {
    this.loader.style.display = show ? "block" : "none";
    this.generateButton.disabled = show;
    this.generateButton.textContent = show
      ? "Generating..."
      : "Generate Recipe";
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove("hidden");
    setTimeout(() => {
      this.errorMessage.classList.add("hidden");
    }, 3000);
  }

  displayRecipe(recipe) {
    if (!recipe) return;

    // Create HTML structure for the recipe
    const html = `
        <h2 class="text-2xl font-bold text-gray-800 mb-4">${
          recipe.title || "Generated Recipe"
        }</h2>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Ingredients</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-600">
            ${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
          </ul>
        </div>
  
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Instructions</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-600">
            ${recipe.instructions.map((inst) => `<li>${inst}</li>`).join("")}
          </ol>
        </div>
  
        ${
          recipe.tips
            ? `
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Tips</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-600">
            ${recipe.tips.map((tip) => `<li>${tip}</li>`).join("")}
          </ul>
        </div>
        `
            : ""
        }
      `;

    this.recipeDisplay.innerHTML = html;
    this.recipeDisplay.classList.add("show");
  }

  getInputData() {
    const ingredients = this.ingredientsInput.value.trim();
    const dietary = this.dietarySelect.value;
    return { ingredients, dietary };
  }
}
