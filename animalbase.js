"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  star: false,
  winner: false,
};

const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  loadJSON();
  // Add event-listeners to filter and sort buttons
  registerButtons();
}

function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));

  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(prepareObject);

  //We filter and sort on the first load
  buildList();
}

function prepareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter}`);
  // filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  // let filteredList = allAnimals;
  if (settings.filterBy === "cat") {
    // create a filtered list of only cats
    filteredList = allAnimals.filter(isCat);
  } else if (settings.filterBy === "dog") {
    // create a filtered list of only dogs
    filteredList = allAnimals.filter(isDog);
  } else if (settings.filterBy === "star") {
    filteredList = allAnimals.filter(isStar);
  }

  return filteredList;
}

function isCat(animal) {
  return animal.type === "cat";
}

function isDog(animal) {
  return animal.type === "dog";
}

function isStar(animal) {
  return animal.star;
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find "old" sortby element, and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  // indicate active sort
  event.target.classList.add("sortby");

  // toggle the direction!
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  // let sortedList = allAnimals;
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(animalA, animalB) {
    if (animalA[settings.sortBy] < animalB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList(allAnimals);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document.querySelector("template#animal").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  if (animal.star === true) {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  function clickStar() {
    if (animal.star === true) {
      animal.star = false;
    } else {
      animal.star = true;
    }

    buildList();
  }

  //Winners
  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
  clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);
  function clickWinner() {
    if (animal.winner === true) {
      animal.winner = false;
    } else {
      tryToMakeAWinner(animal);
    }
    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function tryToMakeAWinner(selectedAnimal) {
  const winners = allAnimals.filter((animal) => animal.winner);
  const numberOfWinners = winners.length;
  const other = winners.filter((animal) => animal.type === selectedAnimal.type).shift();

  //if there is another of the same type
  if (other !== undefined) {
    console.log("There can be only one winner of each type!");
    removeOther(other);
  } else if (numberOfWinners >= 2) {
    console.log("There can only be two winners!");
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedAnimal);
  }

  function removeOther(other) {
    //ask the user to ignore or remove the "other"
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeother").addEventListener("click", clickRemoveOther);

    //if ignore - do nothing ..
    function closeDialog() {
      document.querySelector("#remove_other").classList.add("hide");
      document.querySelector("#remove_other .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_other #removeother").removeEventListener("click", clickRemoveOther);
    }

    //if remove other:
    function clickRemoveOther() {
      removeWinner(other);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeAorB(winnerA, winnerB) {
    //ask the user to ignore or remove A or B
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);

    //if ignore - do nothing ..
    function closeDialog() {
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
      //if removeA:
      removeWinner(winnerA);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }

    function clickRemoveB() {
      //else - if removeB:
      removeWinner(winnerB);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  function makeWinner(animal) {
    animal.winner = true;
  }
}
