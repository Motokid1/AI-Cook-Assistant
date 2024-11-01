document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI Handler
  const uiHandler = new UIHandler();

  // Initialize Recipe Generator
  const recipeGenerator = new RecipeGenerator(uiHandler);

  // Bind generate event
  uiHandler.bindGenerateEvent(async () => {
    // Get input data
    const { ingredients, dietary } = uiHandler.getInputData();

    // Validate ingredients
    if (!ingredients) {
      uiHandler.showError("Please enter some ingredients first.");
      return;
    }

    // Show loading state
    uiHandler.showLoading(true);

    try {
      // Generate recipe
      const recipeText = await recipeGenerator.generateRecipe(
        ingredients,
        dietary
      );

      // Parse recipe sections
      const parsedRecipe = recipeGenerator.parseRecipeSections(recipeText);

      // Display recipe
      uiHandler.displayRecipe(parsedRecipe);
    } catch (error) {
      uiHandler.showError("Failed to generate recipe. Please try again.");
      console.error("Error:", error);
    } finally {
      // Hide loading state
      uiHandler.showLoading(false);
    }
  });
});
