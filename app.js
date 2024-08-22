const select = document.querySelector('.select');
const options = document.querySelector('.options');
const selectOptions = document.querySelectorAll('.option');
const body = document.querySelector('body');
  
select.addEventListener('click', () => {
    select.classList.toggle('open');
    options.classList.toggle('open');
});
  
selectOptions.forEach(option => {
    option.addEventListener('click', () => {
    select.textContent = option.textContent;
    selectOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');

    if (option.classList.contains('selected') && option.classList.contains('serif-option')) {
        body.classList.add('serif-option');
        body.classList.remove('mono-option');
        body.classList.remove('sans');
    } else if (option.classList.contains('selected') && option.classList.contains('mono-option')) {
        body.classList.add('mono-option');
        body.classList.remove('serif-option');
        body.classList.remove('sans');
    } else {
        body.classList.add('sans');
        body.classList.remove('mono-option');
        body.classList.remove('serif-option');
    }

    select.classList.remove('open');
    options.classList.remove('open');
    });
});
  
document.addEventListener('click', (e) => {
    if (!select.contains(e.target)) {
        select.classList.remove('open');
        options.classList.remove('open');
    }
});

const toggle = document.querySelector('.toggle-switch');
const toggleInput = document.querySelector('.toggle-input');
const currentTheme = localStorage.getItem('theme') || 'light';

toggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        toggleInput.checked = false;
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-theme');
        toggleInput.checked = true;
        localStorage.setItem('theme', 'dark');
    }
});

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

async function fetchAPIData() {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(data)
    return data;
}

const resultContainer = document.querySelector('.about');

async function displayInformation (searchValue) {

    resultContainer.innerHTML = '';

    const response = await fetch(`${API_URL}${searchValue}`);
    const data = await response.json();


    if (data && data.length > 0) {
        console.log(data);

        data.forEach(word => {
            const divHeader = document.createElement('div');
            divHeader.classList.add('about__header');

            if (word.phonetics.length === 0) {
                divHeader.innerHTML = `
                    <div>
                        <h1>${word.word}</h1>
                    </div>
                `;
            }else if (word.phonetics[0].audio !== '') {
                divHeader.innerHTML = `
                    <div>
                        <h1>${word.word}</h1>
                        <p class="about__header-transcription">${word.phonetic}</p>
                    </div>
                    <button class="about__header-btn-play">
                        <audio src="${word.phonetics[0].audio}" class="audio-player"></audio>
                    </button>
                `;
            } else {
                divHeader.innerHTML = `
                    <div>
                        <h1>${word.word}</h1>
                        <p class="about__header-transcription">${word.phonetic}</p>
                    </div>
                `;
            }

            resultContainer.appendChild(divHeader);

            const playBtn = divHeader.querySelector('.about__header-btn-play');
            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    const audio = playBtn.querySelector('.audio-player');
                    if (audio) {
                        document.querySelectorAll('.audio-player').forEach(aud => {
                            aud.pause();
                            aud.currentTime = 0;
                        });
                        audio.play();
                    }
                })
            }

            const meanings = word.meanings;

            meanings.forEach(meaning => {
                const article = document.createElement('about__part-of-speech');
                article.classList.add('about__part-of-speech');

                let definitionsList = '<ul>';
                meaning.definitions.forEach(def => {
                    if(def.example && def.example !== '') {
                        definitionsList += `
                            <li>${def.definition}</li>
                            <p class="about__part-of-speech_example">${def.example}</p>
                        `;
                    } else {
                        definitionsList += `<li>${def.definition}</li>`;
                    }
                })
                definitionsList += '</ul>';

                let synonyms = '';
                let arrSynonyms = meaning.synonyms;
                if (arrSynonyms.length > 0) {
                    const links = arrSynonyms.map(synonym => `<a href="#" class="synonym-link">${synonym}</a>`).join(' ');
                    synonyms = `
                        <p class="about__part-of-speech_synonyms">Synonyms: ${links}</p>
                    `;
                }

                article.innerHTML = `
                    <div class="line">
                        <p class="about__part-of-speech_type">${meaning.partOfSpeech}</p>
                        <div></div>
                    </div>
                    <p class="about__part-of-speech_meaning">Meaning</p>
                    ${definitionsList}
                    ${synonyms}
                `;

                resultContainer.appendChild(article);

                const synonymLinks = article.querySelectorAll('.synonym-link');
                synonymLinks.forEach(link => {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        const synonym = link.textContent;
                        searchInput.value = synonym;
                        displayInformation(synonym);
                    })
                })
            })

            const divSource = document.createElement('div');
            divSource.classList.add('about__source');
            divSource.innerHTML = `
                <p>Source</p>
                <a href="${word.sourceUrls}" target="_blank">${word.sourceUrls}
                    <img src="./assets/images/icon-new-window.svg" alt="new-window">
                </a>
            `;

            resultContainer.appendChild(divSource);
        })

    } else {
        const section = document.createElement('section');
        section.classList.add('no-found');
        section.innerHTML = `
            <img src="./assets/images/not-found.png" alt="not-found">
            <p class="no-found__header">No Definitions Found</p>
            <p class="no-found__description">Sorry pal, we couldn't find definitions for the word you were looking for. You can try the search again at later time or head to the web instead.</p>
        `;

        resultContainer.appendChild(section);
    }

}

const searchInput = document.querySelector('#search-input');
const searchBtn = document.querySelector('#search-btn');
const errorText = document.querySelector('.error-text');

searchBtn.addEventListener('click', () => {
    const searchValue = searchInput.value;
    console.log(searchValue);

    if (searchInput.value === '') {
        searchInput.classList.add('error');
        errorText.style.display = 'block';
        resultContainer.innerHTML = '';
        body.style.height = '100vh';
    } else {
        displayInformation(searchValue);
        searchInput.classList.remove('error');
        errorText.style.display = 'none';
        body.style.height = 'auto';
    }

    searchInput.value = '';
})
