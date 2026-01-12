window.addEventListener("popstate", () => homeInitialState());

const composerAllFilter = document.querySelector(".all");

const logoContainer = document.querySelector(".logo");
logoContainer.addEventListener("click", () => {
    homeInitialState();
});

const composersContainer = document.createElement("div");
composersContainer.classList.add("composers-container");

const composerSectionTxt = document.getElementById("composerSectionTxt");
const composerFiltersContainer = document.querySelector(".composer-filters");
const infoContainer = document.querySelector(".info-container");
const composerDetailsContainer = document.createElement("div");
const composerWorksContainer = document.createElement("div");
const worksList = document.createElement("ul");

async function getComposers(url) {
    clearPage();

    // Clear the previous list of composers
    if (composersContainer.childElementCount) {
        composersContainer.innerHTML = "";
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status ${response.status}`);
        }
    
        const result = await response.json();
        const composers = result.composers;
        
        composers.forEach(composer => {
            const composerContainer = document.createElement("div");
            composerContainer.classList.add("composer-container");
            const composerInfoContainer = document.createElement("div");
            composerInfoContainer.classList.add("detailsWrapper");

            const avatar = document.createElement("img");
            avatar.classList.add("avatar");
            avatar.setAttribute("src", composer.portrait);

            const name = document.createElement("h2");
            name.textContent = composer.complete_name;

            const composerInfo = document.createElement("ul");
            composerInfo.classList.add("composer-info");

            // Slicing both birthDate and deathDate data to four characters
            // to get only the year of birth and year of death of the composer.
            const birthDate = document.createElement("li");
            birthDate.textContent = composer.birth.slice(0, 4);

            const bulletFormat = document.createElement("li");
            bulletFormat.textContent = "·";

            // If the composer is still alive then we show a dash (-) symbol,
            // otherwise we just show the year of death.
            const deathDate = document.createElement("li");
            deathDate.textContent = composer.death?composer.death.slice(0, 4):"-";

            const bulletFormat2 = document.createElement("li");
            bulletFormat2.textContent = "·";

            const period = document.createElement("li");
            period.textContent = composer.epoch;
            composerInfo.append(birthDate, bulletFormat, deathDate, bulletFormat2, period);
            
            const composersWork = document.createElement("a");
            composersWork.textContent = `${composer.name} works`;
            composersWork.setAttribute("href", `/composer/${composer.id}`);
            
            composerInfoContainer.append(name, composerInfo, composersWork);
            composerContainer.append(avatar, composerInfoContainer);
            composersContainer.append(composerContainer);
            infoContainer.append(composersContainer);
            
        });
    } catch (error) {
        console.error(error.message);
    }
}

async function getComposerWorks(composerID) {
    clearPage();
    composerSectionTxt.style.display = "none";
    composerFiltersContainer.style.display = "none";

    const url = `https://api.openopus.org/work/list/composer/${composerID}/genre/all.json`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}.`);
        }

        const result = await response.json();
        
        const composer = {
            avatar: result.composer.portrait,
            fullName: result.composer.complete_name,
            shortenedName: result.composer.name,
            birthDate: result.composer.birth.slice(0, 4),
            deathDate: result.composer.death?result.composer.death.slice(0, 4):"-",
            period: result.composer.epoch,
        };

        composerDetailsContainer.innerHTML = `
            <a class="back-button" onclick="homeInitialState()" href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
            </svg>
            Back to composers</a>
            <div class="composer-section">
                <img class="composer-avatar" alt="${composer.shortenedName} avatar" src="${composer.avatar}">
                <div>
                    <h1>${composer.fullName}</h1>
                    <ul class="composer-quick-info">
                        <li>${composer.period}</li>
                        <li>·</li>
                        <li>${composer.birthDate}</li>
                        <li>·</li>
                        <li>${composer.deathDate}</li>
                    </ul>
                </div>
            </div>
            <h2 class="works-section">Works</h2>
        `;

        const works = result.works;
        
        worksList.classList.add("list-of-works");
        
        works.forEach( work => {
            const workName = document.createElement("li");
            workName.classList.add("work-name");
            workName.textContent = work.title;
            worksList.append(workName);
        })
        composerWorksContainer.append(worksList);
        infoContainer.append(composerDetailsContainer, composerWorksContainer);
    }
    catch (error) {
        console.error(error.message);
    }
}

function clearPage() {
    infoContainer.innerHTML = "";

    // If the "Composer" title of the homepage it's hidden and the user clicked
    // to go to the homepage, then display it again.
    if (composerSectionTxt.style.display === "none" && window.location.pathname === "/") {
        composerSectionTxt.style.display = "block";
    }

    // The same rule as before also applies here, but for the composer filters.
    if (composerFiltersContainer.style.display === "none" && window.location.pathname === "/") {
        composerFiltersContainer.style.display = "block";
    }

    // If the user has went to any composer page before, then clear the 
    // previous list of works of that composer.
    if (worksList) {
        worksList.innerHTML = "";
    }
}

function removeFilter() {
    const composerFilters = document.querySelectorAll(".composer-filter");

    // If any filter button already has an "active-filter" class, then we
    // remove it.
    composerFilters.forEach(filter => {
        if (filter.classList[2]) {
            filter.classList.remove("active-filter")
        }
    })
}

$(".composer-filter").on("click", (e) => {
  const filterCategory = e.target.classList[1];
  const currentFilter = e.currentTarget;

  switch (filterCategory) {
    case "all":
      removeFilter();
      getComposers("https://api.openopus.org/dyn/composer/list.phtml");
      currentFilter.classList.add("active-filter");
      break;
    case "popular":
      removeFilter();
      getComposers("https://api.openopus.org/dyn/composer/list/pop.json");
      currentFilter.classList.add("active-filter");
      break;
    case "essential":
      removeFilter();
      getComposers("https://api.openopus.org/dyn/composer/list/rec.json");
      currentFilter.classList.add("active-filter");
      break;
    default:
      break;
  }
});

function homeInitialState() {
    clearPage();
    removeFilter();
    composerAllFilter.classList.add("active-filter");
}

page("/", async () => getComposers("https://api.openopus.org/dyn/composer/list.phtml"));
page(`/composer/:id`, async (ctx) => getComposerWorks(ctx.params.id));

// The hashbang (#!) it's a necessary evil we need in order for users to be
// able to load any composer's page just by typing its path in the URL.
page({hashbang: true});