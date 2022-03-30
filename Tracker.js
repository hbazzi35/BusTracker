
let markerArray = [];
let busArray = [];
let darkMode = true;
let runStatus = false;
var runTimeout;
var refreshTimeout;
let refreshTimer = 15; 
const refreshRate = 15000;
mapboxgl.accessToken = 'pk.eyJ1IjoiYmF6emloMzUxOSIsImEiOiJjbDFjdno1bTEwMDVnM2NxZmxsZHowMG5oIn0.MjLsi8hLI2Y68KqDDZzBCQ';  

let lastUpdated = document.getElementById('lastUpdated');
const displayButton = document.getElementById('displayButton');
const runButton = document.getElementById('runButton');
const refreshCountdown = document.getElementById('refreshTimer');
const pText = document.getElementsByTagName('p');
const h5Text = document.getElementsByTagName('h5');

refreshCountdown.innerText = refreshTimer;

const randomColor = () => {
    const getRandom = (scale) => {
        return Math.floor(Math.random() * scale);
    }
    return `rgb(${getRandom(255)},${getRandom(255)},${getRandom(255)})`;
}

const run = async () => {
    busArray = await getBusLocations();
    lastUpdated.innerText = new Date();
    refreshTimer = refreshRate / 1000;
    for (bus of busArray) {
        const item = getMarker(bus['id']);
        if (!item) {
            makeMarker(bus, bus['id']);
        } else {
            const marker = Object.values(item)[0];
            updateMarker(marker, bus);
        }
    }
    console.log(busArray);
    updateList();
    runTimeout = setTimeout(run, refreshRate);
}

const getBusLocations = async () => {
    const response = await fetch('https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip');
    const json = await response.json();
    return json.data;
}

const makeMarker = (bus, id) => {
    let color = randomColor();
    const marker = new mapboxgl.Marker({
            color: color
        })
        .setLngLat([bus['attributes']['longitude'], bus['attributes']['latitude']])
        .addTo(map);
    const item = {
        "marker": marker,
        "id": id,
        "color": color
    };
    markerArray.push(item);
}

const getMarker = (busId) => {
    const result = markerArray.find((item) =>
        item['id'] === busId
    );
    return result;
}

const updateMarker = (marker, bus) => {
    marker.setLngLat([bus['attributes']['longitude'], bus['attributes']['latitude']])
}

const updateList = () => {
    let html = '';
    let list = document.getElementById('list');
    for (marker of markerArray) {
        html += `<li id='${marker.id}' style='color:${marker.color}'>${marker.id.toUpperCase()}</li>`;
    }
    list.innerHTML = html;
}

const cips = (data) => {
    let output = '';
    for (let i = 0; i < data.length; i++) {
        let char = data[i];
        if (char.match(/[a-z]/i)) {
            let code = data.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
        }
        output += char;
    }
    return output;
};

const buttonEffect = (buttonId) => {
    let buttonClicked = document.getElementById(buttonId);
    buttonClicked.classList.add('buttonEffect');
    buttonClicked.addEventListener('transitionend', () => {
        buttonClicked.classList.remove('buttonEffect');
    }, {
        once: true
    });
}

const toggleStatus = () => {
    if (!runStatus) {
        runStatus = !runStatus;
        runButton.innerText = 'Live';
        runButton.onclick = '';
        runButton.classList.add('buttonEffect');
        run();
        return
    }
}

const timer = () => {
    refreshTimer -= 0.1;
    refreshCountdown.innerText = refreshTimer.toFixed(1);
    refreshTimeout = setTimeout(timer, 100);
}

const displayMode = () => {
    if (darkMode) {
        clearMap();
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/satellite-streets-v11',
            center: [-71.104081, 42.365554],
            zoom: 12,
        }).addControl(new mapboxgl.NavigationControl());
        darkMode = !darkMode;
        displayButton.classList.toggle('lightmode');
        runButton.classList.toggle('lightmode');
        toggleLightModeText();
        return;
    }
    clearMap();
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [-71.104081, 42.365554],
        zoom: 12,
    }).addControl(new mapboxgl.NavigationControl());
    displayButton.classList.toggle('lightmode')
    runButton.classList.toggle('lightmode')
    darkMode = !darkMode;
    toggleLightModeText();
}

const toggleLightModeText = () => {
    for (p of pText) {
        p.classList.toggle('lightText');
    }
    h5Text[0].classList.toggle('lightText');
}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/navigation-night-v1',
    center: [-71.104081, 42.365554],
    zoom: 12,
}).addControl(new mapboxgl.NavigationControl());

const clearMap = () => {
    myMap = document.getElementById('map');
    myMap.innerHTML = '';
    markerArray = [];
    if (runStatus) {
        clearTimeout(runTimeout)
        setTimeout(run,500);
    }
}