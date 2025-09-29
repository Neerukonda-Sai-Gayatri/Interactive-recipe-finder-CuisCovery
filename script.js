// Only run if we're on results.html
if (window.location.pathname.includes("results.html")) {
  const params = new URLSearchParams(window.location.search);
  let ingredients = params.get("ingredients");
  let currentPage = 1;
  const recipesPerPage = 6;
  let allRecipes = [];

  const recipesDiv = document.getElementById("recipes");

  // Pre-fill search input
  const inputField = document.getElementById("ingredientInputResults");
  if (inputField && ingredients) inputField.value = ingredients;

  // Fetch and display recipes
  async function findRecipes(ingredients) {
    const apiKey = "f53ef9cae0d844c9953686821dd55f22"; // 🔑 Replace with your Spoonacular API key

recipesDiv.innerHTML = `
  <div class="spinner"></div>
  <p class="loading-message">Cooking up some delicious recipes for you... </p>
`;

    try {
      const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=50&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data || data.length === 0) {
        recipesDiv.innerHTML = "<p>No recipes found. Try different ingredients!</p>";
        return;
      }

      allRecipes = data;
      currentPage = 1;
      renderPage();

    } catch (error) {
      console.error("Error fetching recipes:", error);
      recipesDiv.innerHTML = "<p>⚠️ Error fetching recipes. Please try again later.</p>";
    }
  }

  // Render recipes per page with pagination
  function renderPage() {
    recipesDiv.innerHTML = ""; // clear previous

    const start = (currentPage - 1) * recipesPerPage;
    const end = start + recipesPerPage;
    const recipesToShow = allRecipes.slice(start, end);

    recipesToShow.forEach(recipe => {
      const recipeCard = document.createElement("div");
      recipeCard.classList.add("recipe-card");

      const recipeUrl = `https://spoonacular.com/recipes/${encodeURIComponent(recipe.title.replace(/ /g, "-"))}-${recipe.id}`;

      recipeCard.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}">
        <p>Used Ingredients: ${recipe.usedIngredientCount}</p>
        <p>Missing Ingredients: ${recipe.missedIngredientCount}</p>
        <a href="${recipeUrl}" target="_blank">View Recipe</a>
      `;

      recipeCard.addEventListener("dblclick", () => {
        window.open(recipeUrl, "_blank");
      });

      recipeCard.addEventListener("click", (event) => {
        if (event.target.tagName !== "A") {
          window.open(recipeUrl, "_blank");
        }
      });

      recipesDiv.appendChild(recipeCard);
    });

    renderPagination();
  }

  // Pagination buttons
  function renderPagination() {
    const totalPages = Math.ceil(allRecipes.length / recipesPerPage);
    if (totalPages <= 1) return; // No need for pagination

    const paginationDiv = document.createElement("div");
    paginationDiv.classList.add("pagination");

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      currentPage--;
      renderPage();
    });
    paginationDiv.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;

      if (i === currentPage) {
        pageBtn.classList.add("current");
      } else {
        pageBtn.addEventListener("click", () => {
          currentPage = i;
          renderPage();
        });
      }
      paginationDiv.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      currentPage++;
      renderPage();
    });
    paginationDiv.appendChild(nextBtn);

    recipesDiv.appendChild(paginationDiv);
  }

  // Initial fetch
  if (ingredients) findRecipes(ingredients);

  // Search bar functionality on results page
  const form = document.getElementById("recipeFormResults");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const newIngredients = document.getElementById("ingredientInputResults").value.trim();
    if (newIngredients) {
      window.history.replaceState({}, '', `results.html?ingredients=${encodeURIComponent(newIngredients)}`);
      findRecipes(newIngredients);
    }
  });
}
