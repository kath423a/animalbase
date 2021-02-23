"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
};

function start() {
  console.log("ready");

  // TODO: Add event-listeners to filter
  document.querySelector("#cat").addEventListener("click", clickCat);
  document.querySelector("#dog").addEventListener("click", clickDog);
  document.querySelector("#all").addEventListener("click", clickAll);

  //and sort buttons
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));

  loadJSON();
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(preapareObject);

  // TODO: This might not be the function we want to call first
  displayList(allAnimals);
}

function clickCat() {
  const onlyCats = allAnimals.filter(isCat);
  displayList(onlyCats);
}

function isCat(animal) {
  console.log("Clicked on cat");
  if (animal.type == "cat") {
    return true;
  } else {
    return false;
  }
}

function clickDog() {
  const onlyDogs = allAnimals.filter(isDog);
  displayList(onlyDogs);
}

function isDog(animal) {
  console.log("Clicked on dog");
  if (animal.type == "dog") {
    return true;
  } else {
    return false;
  }
}

function clickAll() {
  const themAll = allAnimals;
  displayList(themAll);
}

function displayAll(animal) {
  console.log("Clicked on all");
  return true;
}

function preapareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  console.log(`User selected ${sortBy}`);
  sortList(sortBy);
}

function sortList(sortBy) {
  let sortedList = allAnimals;

  if (sortBy == "name") {
    sortedList = sortedList.sort(sortByName);
  } else if (sortBy == "type") {
    sortedList = sortedList.sort(sortByType);
  }

  displayList(sortedList);
}

function sortByName(animalA, animalB) {
  if (animalA.name < animalB.name) {
    return -1;
  } else {
    return 1;
  }
}

function sortByType(animalA, animalB) {
  if (animalA.type < animalB.type) {
    return -1;
  } else {
    return 1;
  }
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

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
