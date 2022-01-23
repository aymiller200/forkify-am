/* 
!Functionality: 

  ? Search for recipes: 
      * Search functionality: input fiels to send request to API with searched keywords
      * Display results with pagination
      * Display recipe with cooking time, servings and ingredients
  ? Update Number of servings: 
      * Change servings functionality: update all ingredients according to current number of servings. 
  ? Bookmark recipes: 
      * Bookmarking functionality: display list of all bookmarked recipes; 
  ? Create my own recipes: 
      * User can upload own recipes
      * User recipes will automatically be bookmarked
      * User can only see their own recipes, not recipes from other users. 
  ? See my bookmarks and own recipes when I leave the app and come back later: 
      * Store bookmark data in the browser using local storage
      * On page load, read saved bookmarks from local storage and display

! Architecture: 
  ? Structure (way we organize our code), Maintainability (We need to be able to easily change it in the future), Expandability (Easily add new features)
  ? Can create own architecture for smalle projects.
  ? For larger projects we can use a well-established architecture pattern like MVC (Model view controller), MVP (Model view presenter), Flux, etc.
  ? Can also use frameworks like react, angular, bue, Svelte, etc to handle architecture for us.

  * Components of any architecture: 
      ? Business Logic
          * Code that solves the actual business problem
          * Directly Related to what business does and what it needs
          * EX: Sending messages, storing transactions, calculating taxes
      ? State
          * Essentially stores all the data about the application. 
          * Shold be the "single source of truth"
          * UI should be kept in sync with the state
          * State Libraries exist
      ? HTTP Library
          * Responsible for making and received AJAX requests
          * Optional but almost always necessary in real-world apps
      ? Application Logic (router)
          * Code that is only concered about the implementation os application itself. 
          * Handles Navigation and UI events
      ? Presentation Logic (UI layer)
          * Code that is concerned about the visible part of the application. 
          * Essentially display application state.
      
  ? MVP: 
      * Model (web)
          ? Business logic
          ? state
          ? HTTP library
      * View (user)
          ? Presentation logic
      * Controller
          ? Application logic
          ? Bridge between model and views (which don't know about one another)
          ? Handles UI events and dispatches tasks to model and view
  
  ? Event Handing in MVC: Publisher-subscriber pattern
      * Events should be handled in the controller (otherwise wwe would have application logic in the view)
      * Events should be listened for in the view (otherwise we would need dom elements in the controller)
      * Publisher --> Code that knows when to react
      * Subscriber --> Code that wants to react
      * Subscribe to publisher by passing the subscriber function
      * controlRecipes will be passed into addHandlerRender when program starts
      * addHandlerRender listens for events (addEventListener), and uses controlRecipes as callback


*/
import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'

import 'core-js/stable' //polyfilling everything else
import 'regenerator-runtime/runtime' //polyfilling async await

// if(module.hot){
//     module.hot.accept()
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1)
    if (!id) return
    recipeView.renderSpinner()

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())

    // updating bookmarksView
    bookmarksView.update(model.state.bookmarks)

    //1. loading recipe
    await model.loadRecipe(id) //just manipulates the state, does not return anything

    //2. Rendering recipe
    recipeView.render(model.state.recipe)
  } catch (err) {
    recipeView.renderError()
  }
}

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner()
    // Get search query
    const query = searchView.getQuery()
    if (!query) return

    // Load search
    await model.loadSearchResults(query)

    //Render Results
    resultsView.render(model.getSearchResultsPage())

    //Render initial pagination buttons
    paginationView.render(model.state.search)
  } catch (err) {
    console.log(err)
  }
}

const controlPagination = function (goToPage) {
  //Render new Results
  resultsView.render(model.getSearchResultsPage(goToPage))

  //Render new pagination buttons
  paginationView.render(model.state.search)
}

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings)
  // Update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function () {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)

  //update recipe view
  recipeView.update(model.state.recipe)

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {
    //Spinner
    addRecipeView.renderSpinner()
    //upload new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe)

    //render recipe
    recipeView.render(model.state.recipe)

    //Success Message
    addRecipeView.renderMessage()

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks)

    //Change id in url (history APIR)
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    //close form window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    }, 1000)

  } catch (err) {
    addRecipeView.renderError(err.message)
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}

init()
