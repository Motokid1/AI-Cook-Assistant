// historyManager.js

const HistoryManager = (() => {
  const STORAGE_KEY = "appHistory";

  // Function to retrieve all history data
  const getHistory = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  // Function to save history data
  const saveHistory = (module, entry) => {
    const historyData = getHistory();
    if (!historyData[module]) {
      historyData[module] = [];
    }
    historyData[module].push({
      timestamp: new Date().toISOString(),
      entry,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
  };

  return {
    saveHistory,
    getHistory,
  };
})();

// Usage:
// HistoryManager.saveHistory('calorieTracker', 'Calories for apple: 95');
// const history = HistoryManager.getHistory();
