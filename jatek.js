const params = new URLSearchParams(window.location.search);
const JATEKOSOK_SZAMA = parseInt(params.get("jatekosok")) || 0;
const CEL_PONTSZAM = 250;

let globalisPontszam = 0; // A régi "PontSzamok" változó
let mainContainer;

let playersData = []

let maxRounds = 5;
let currRound = 1;

function initialize() {
    mainContainer = document.getElementById("main");
    renderPlayerNameInputs();
}

// 1. lépés: Játékos nevek bekérése
function renderPlayerNameInputs() {
    const playerDiv = document.createElement("div");
    playerDiv.className = "nameDiv";
    playerDiv.id = "playersNameDiv";
    playerDiv.innerHTML = ""; // Biztosítjuk, hogy üres legyen

    for (let i = 0; i < JATEKOSOK_SZAMA; i++) {
        const wrapper = document.createElement("div");
        
        const title = document.createElement("h2");
        title.innerText = `${i + 1}. Játékos`;
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "playerInputClass";
        
        wrapper.append(title, input);
        playerDiv.appendChild(wrapper);
    }

    const round = document.createElement("h2");
    round.innerText = `Körök száma`;
    playerDiv.appendChild(round);
    
    const roundsInput = document.createElement("input")
    roundsInput.type = "number";
    roundsInput.value = 5;
    roundsInput.min = 1;
    roundsInput.id = "gameRounds";
    
    playerDiv.appendChild(roundsInput);

    const startBtn = document.createElement("input");
    startBtn.type = "button";
    startBtn.value = "Játék indítása";
    startBtn.style.fontSize = "4vw";
    startBtn.onclick = loadPlayers;
    playerDiv.appendChild(startBtn);

    mainContainer.appendChild(playerDiv);
}

// Segédfüggvény: Üres mezők ellenőrzése
function hasEmptyPlayerField() {
    const inputs = document.getElementsByClassName("playerInputClass");
    for (let input of inputs) {
        if (input.value.trim() === "") return true;
    }
    return false;
}

// 2. lépés: A játéktér felépítése
function loadPlayers() {
    if (hasEmptyPlayerField()) {
        alert("Hiányzó játékos név!");
        return;
    }

    maxRounds = document.getElementById("gameRounds").value
    const playerInputs = document.getElementsByClassName("playerInputClass");

    for (let i = 0; i < JATEKOSOK_SZAMA; i++) {
        createPlayerBoard(i, playerInputs[i].value);
        playerDataCreate(i, playerInputs[i].value)
    }

    // Input mezők elrejtése
    document.getElementById("playersNameDiv").style.display = "none";

    // Rögzítés gomb létrehozása
    createPinButton();
    createRoundDisplay();
}

function playerDataCreate(index, name){
    let newPlayer = {
        id: index,
        name: name,
        points: 0,
        totalPoints: 0
    }
    playersData.push(newPlayer);    
}

function createRoundDisplay(){
    const roundDisplay = document.createElement("h1");
    roundDisplay.id = "roundDisplay";
    roundDisplay.innerText = `${currRound}/${maxRounds}`;
    mainContainer.appendChild(roundDisplay);
}

function updateRoundDisplay(){
    const roundDisplay = document.getElementById("roundDisplay");
    roundDisplay.innerText = `${currRound}/${maxRounds}`;
}

// Egy játékos táblájának létrehozása
function createPlayerBoard(index, name) {
    const playerContainer = document.createElement("div");
    playerContainer.classList.add(`jatekos${index}`);

    // Név
    const nameHeader = document.createElement("h1");
    nameHeader.innerText = name;
    nameHeader.classList.add("jatekos-nev");

    // Pontszám kijelző
    const scoreDisplay = document.createElement("h1");
    const scoreClass = `osszPont${index}`;
    scoreDisplay.classList.add(scoreClass, "pontszam-kijelzo");
    scoreDisplay.innerText = "Pontszám: 0";
    scoreDisplay.dataset.score = "0"; // Adat attribútumban is tároljuk a könnyebb kezelésért

    // Pont gombok konténere
    const pointsContainer = document.createElement("div");
    pointsContainer.classList.add("pontokDiv");

    // Gombok generálása (1-20 és 40)
    for (let j = 1; j <= 21; j++) {
        const pointValue = (j !== 21) ? j : 40;
        const pointBtn = document.createElement("div");
        
        pointBtn.classList.add("pontDiv");
        pointBtn.innerText = pointValue;

        // Eseménykezelő
        pointBtn.addEventListener("click", function() {
            // CSS osztály toggle a stílusváltáshoz
            this.classList.toggle("kivalasztva");
            
            const isSelected = this.classList.contains("kivalasztva");
            updateScore(scoreDisplay, pointValue, isSelected, index);

        });

        pointsContainer.appendChild(pointBtn);
    }

    playerContainer.append(nameHeader, pointsContainer, scoreDisplay);
    mainContainer.append(playerContainer, document.createElement("hr"));
}

function createPinButton() {
    const btn = document.createElement("input");
    btn.id = "pinBtn";
    btn.type = "button";
    btn.value = "Rögzít";
    btn.style.fontSize = "4vw";
    btn.onclick = pin;
    mainContainer.appendChild(btn);
}

// Pontszám frissítése
function updateScore(scoreElement, value, isAdding, ID) {
    let currentScore = parseInt(scoreElement.dataset.score);
    const amount = parseInt(value);

    // Globális és helyi változók frissítése
    if (isAdding) {
        globalisPontszam += amount;
        currentScore += amount;
        playersData[ID].points += amount;
    } else {
        globalisPontszam -= amount;
        currentScore -= amount;
        playersData[ID].points -= amount;
    }
    playersData[ID].totalPoints = currentScore;

    console.log(`Játékos: ${playersData[ID].name} Pontjai: ${playersData[ID].points} Összes: ${playersData[ID].totalPoints}`)

    // UI és adat attribútum frissítése
    scoreElement.dataset.score = currentScore;
    scoreElement.innerText = `Pontszám: ${currentScore}`;
    
    console.log("Összesített globális pont:", globalisPontszam);
}

// Rögzítés és ellenőrzés
function pin() {
    // Az eredeti logika megőrizve: 
    // Ha > 250, hibaüzenet, hogy legyen kisebb.
    // Ha < 250, hibaüzenet, hogy legyen nagyobb.
    if (globalisPontszam > CEL_PONTSZAM) {
        alert("Az összesített pontszám kisebb, mint 250! (Jelenleg: " + globalisPontszam + ")");
        return;
    } else if (globalisPontszam < CEL_PONTSZAM) {
        alert("Az összesített pontszám nagyobb, mint 250! (Jelenleg: " + globalisPontszam + ")");
        return;
    }

    // Ha pontosan 250, akkor reseteljük a gombok kinézetét
    const allPointButtons = document.getElementsByClassName("pontDiv");
    for (let btn of allPointButtons) {
        btn.classList.remove("kivalasztva");
    }

    let isLastRound = currRound == maxRounds;

    if(isLastRound){
        gameEnd()
        return
    }

    let loser = findLoser();
    console.log(loser);

    let result = createRoundResult(loser)

    currRound++;

    updateRoundDisplay();

    alert(result);
    globalisPontszam = 0;
}
// Megkeresi a vesztest a körben
function findLoser(){
    let loser = playersData[0];

    for(let i = 1; i < playersData.length;i++){
        if(loser.points < playersData[i].points )
            loser = playersData[i];
    }

    return loser;
}
// Összeállítja a kör végeredményét
function createRoundResult(loser){
    let result = "pontszámok\n";
    for(let i = 0; i < playersData.length;i++){
        if(loser == playersData[i]){
            result += `${playersData[i].name} - ${playersData[i].points} Vesztes\n`;
        }
        else{
            result += `${playersData[i].name} - ${playersData[i].points}\n`;
        }

        playersData[i].points = 0;
    }
return result
}

function gameEnd(){
    let gameLoser = playersData[0];

    for(let i = 1; i < playersData.length;i++){
        if(gameLoser.totalPoints < playersData[i].totalPoints )
            gameLoser = playersData[i];
    }

    alert(`Vége a játéknak!\n Vesztes játékos: ${gameLoser.name} pontjai: ${gameLoser.totalPoints}`);

    let pinBTN = document.getElementById("pinBtn");
    pinBTN.value = "Új játék" ;
    pinBTN.onclick = resetGame;

}
function resetGame(){

    window.location.href = "index.html"
    /*
    playersData = []
    mainContainer.innerHTML = "";
    renderPlayerNameInputs();
    globalisPontszam = 0;
    currRound = 1;*/
}