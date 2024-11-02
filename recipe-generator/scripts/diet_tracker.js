// diet_tracker.js

// Gemini API Configuration
const GEMINI_API_KEY = "YOUR_API_KEY"; // Replace with your actual key
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
  GEMINI_API_KEY;

// Event listener for tracking nutrition information
document
  .getElementById("trackButton")
  .addEventListener("click", async function () {
    const foodItem = document.getElementById("foodInput").value.trim();
    const servings = document.getElementById("servingsInput").value || 1;

    if (!foodItem) {
      alert("Please enter a food item");
      return;
    }

    // Show loading indicator
    const loadingIndicator = document.getElementById("loadingIndicator");
    const outputDiv = document.getElementById("dietTrackerOutput");
    loadingIndicator.classList.remove("hidden");
    outputDiv.innerHTML = "";

    try {
      // Prompt for comprehensive nutrition analysis
      const prompt = `Provide detailed nutritional information for ${servings} serving(s) of ${foodItem}. Include:
    1. Calories
    2. Macronutrients (protein, carbs, fat)
    3. Key micronutrients
    4. Health benefits
    5. Serving size details
    Format the response as a clear, easy-to-read list.`;

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      });

      const data = await response.json();

      // Hide loading indicator
      loadingIndicator.classList.add("hidden");

      // Extract and display nutrition information
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const nutritionText = data.candidates[0].content.parts[0].text;
        outputDiv.innerHTML = `
        <div class="nutrient-detail">
          <h3 class="font-bold text-lg text-green-600 mb-2">${foodItem} Nutrition</h3>
          <pre class="whitespace-pre-wrap">${nutritionText}</pre>
        </div>
      `;
      } else {
        outputDiv.innerHTML = `<p class="text-red-500">Unable to retrieve nutrition information.</p>`;
      }
    } catch (error) {
      console.error("Nutrition Analysis Error:", error);
      loadingIndicator.classList.add("hidden");
      outputDiv.innerHTML = `
      <p class="text-red-500">
        Error fetching nutrition data. Please check your internet connection or try again later.
      </p>
    `;
    }
  });

// Event listener for generating weekly calorie plan
document
  .getElementById("generateWeeklyPlan")
  .addEventListener("click", async function () {
    const dailyCalorieGoal = document.getElementById("dailyCalorieGoal").value;
    const dietPreference = document.getElementById("dietPreference").value;
    const numberOfDays = document.getElementById("numberOfDays").value || 7;

    if (!dailyCalorieGoal) {
      alert("Please enter your daily calorie goal.");
      return;
    }

    const loadingIndicator = document.getElementById("loadingIndicator");
    const weeklyOutputDiv = document.getElementById("weeklyPlanOutput");
    loadingIndicator.classList.remove("hidden");
    weeklyOutputDiv.innerHTML = "";

    try {
      // Prompt to get a detailed weekly meal plan with user-defined options
      const prompt = `Create a ${numberOfDays}-day meal plan for a ${dietPreference} diet, adhering to a daily calorie goal of ${dailyCalorieGoal} calories.
    Include breakfast, lunch, dinner, and snack options, with meals that align with the specified calorie intake and diet preference.
    Format each day's meal suggestions in a list format.`;

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
        }),
      });

      const data = await response.json();
      loadingIndicator.classList.add("hidden");

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        weeklyOutputDiv.innerHTML = `
        <div class="nutrient-detail">
          <h3 class="font-bold text-lg text-green-600 mb-2">Weekly Meal Plan</h3>
          <pre class="whitespace-pre-wrap">${data.candidates[0].content.parts[0].text}</pre>
        </div>
      `;
      } else {
        weeklyOutputDiv.innerHTML = `<p class="text-red-500">Unable to retrieve the weekly plan.</p>`;
      }
    } catch (error) {
      console.error("Weekly Plan Error:", error);
      loadingIndicator.classList.add("hidden");
      weeklyOutputDiv.innerHTML = `
      <p class="text-red-500">
        Error fetching the weekly plan. Please try again later.
      </p>
    `;
    }
  });

// histroy functionality

// diet_tracker.js

document
  .getElementById("trackButton")
  .addEventListener("click", async function () {
    // existing code to get nutrition details
    try {
      // ... fetch logic

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const nutritionText = data.candidates[0].content.parts[0].text;
        outputDiv.innerHTML = `
          <div class="nutrient-detail">
            <h3 class="font-bold text-lg text-green-600 mb-2">${foodItem} Nutrition</h3>
            <pre class="whitespace-pre-wrap">${nutritionText}</pre>
          </div>
        `;

        // Save to history
        HistoryManager.saveHistory(
          "calorieTracker",
          `${foodItem}: ${nutritionText}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
