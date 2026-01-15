const params = new URLSearchParams(window.location.search);
const JATEKOSOK_SZAMA = parseInt(params.get("jatekosok")) || 0;
const CEL_PONTSZAM = 250;

let mainContainer;

let playersData = []

let maxRounds = 5;
let currRound = 1;

let roundLoserID = 0;

function initialize() {
    mainContainer = document.getElementById("main");
    gameStart();
}

function gameStart(){
    createPlayerNameInputs();
}

// 1. lépés: Játékos nevek bekérése
function createPlayerNameInputs() {
    const playerDiv = document.createElement("div");
    playerDiv.className = "nameDiv";
    playerDiv.id = "playersNameDiv";

    // Létrehozunk annyi szövegmezőt ahány játékos van
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

    createRoundsInput(playerDiv);
    createStartButton(playerDiv);

    mainContainer.appendChild(playerDiv);
}
// A körök számát beállító input
function createRoundsInput(playerDiv){
    const round = document.createElement("h2");
    round.innerText = `Körök száma`;
    playerDiv.appendChild(round);
    
    const roundsInput = document.createElement("input")
    roundsInput.type = "number";
    roundsInput.value = 5;
    roundsInput.min = 1;
    roundsInput.id = "gameRounds";
    playerDiv.appendChild(roundsInput);
}

// Játék indító gomb
function createStartButton(playerDiv){
    const startBtn = document.createElement("input");
    startBtn.type = "button";
    startBtn.value = "Játék indítása";
    startBtn.style.fontSize = "4vw";
    startBtn.onclick = loadPlayers;
    playerDiv.appendChild(startBtn);
}

// Segédfüggvény: Üres mezők ellenőrzése
function hasEmptyPlayerField() {
    let isAnyEmpty = false;
    const inputs = document.getElementsByClassName("playerInputClass");
    
    for (let input of inputs) {
        if (input.value.trim() === "") {
            input.classList.add("missingName");
            isAnyEmpty = true;
        } else {
            input.classList.remove("missingName");
        }
    }
    return isAnyEmpty;
}

// 2. lépés: A játéktér felépítése
function loadPlayers() {
    if (hasEmptyPlayerField()) {
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
    createErrorOutput()
    createRoundDisplay();
    createRoundResultDisplay()

}

function createRoundResultDisplay(){
    const pointsH1 = document.createElement("h1");
    pointsH1.innerText = "Pontszámok"
    mainContainer.append(pointsH1,document.createElement("hr"))
    
    const roundResultDisplay = document.createElement("h1");
    roundResultDisplay.id = "resultDisplay";
    mainContainer.appendChild(roundResultDisplay);
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
function createErrorOutput(){
    const msgDiv = document.createElement("div");
    msgDiv.className = "errorOutput";
    msgDiv.innerText = "Hibaüzenet helye";
    mainContainer.appendChild(msgDiv);
    
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

function updateRoundResultDisplay(){
    let loser = findLoser();
    let result = createRoundResult(loser);

    document.getElementById("resultDisplay").innerText = result;
}

function updateAllPlayersCountDisplay(){
    const currPointsDisplay = document.getElementsByClassName("pontszam-kijelzo");
    const totalPointsDisplay = document.getElementsByClassName("osszpontszam-kijelzo"); 

    for(let i = 0; i < currPointsDisplay.length; i++){
        currPointsDisplay[i].innerText = `Pontszám: ${playersData[i].points}`
        totalPointsDisplay[i].innerText = `Összesített Pontszám: ${playersData[i].totalPoints}`           
    }
}

// Egy játékos táblájának létrehozása
function createPlayerBoard(index, name) {
    const playerContainer = document.createElement("div");
    playerContainer.classList.add(`jatekos${index}`);

    // Játékos elemeit tároló tömb
    let playerElements = [];
    playerElements.push(createNameElement(name));
    playerElements.push(createPointsContainerElement());
    playerElements.push(createCurrentPointsElement());
    playerElements.push(createTotalPointsElement());

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
            updateScore(playerElements[2], playerElements[3], pointValue, isSelected, index);

        });

        playerElements[1].appendChild(pointBtn);
    }

    playerContainer.append(playerElements[0], playerElements[1], playerElements[2],playerElements[3]);
    mainContainer.append(playerContainer, document.createElement("hr"));
}

// Név
function createNameElement(name){
    const nameHeader = document.createElement("h2");
    nameHeader.innerText = name;
    nameHeader.classList.add("jatekos-nev-cim"); 
    return nameHeader;
}

// Pont kártya tároló
function createPointsContainerElement(){
    const pointsContainer = document.createElement("div");
    pointsContainer.classList.add("pontokDiv");
    return pointsContainer;
}

// Aktuális pont kijelző
function createCurrentPointsElement(){
    const currentScoreDisplay = document.createElement("h1");
    currentScoreDisplay.classList.add("pontszam-kijelzo");
    currentScoreDisplay.innerText = "Pontszám: 0";
    return currentScoreDisplay;
}

// Összesített pont kijelző
function createTotalPointsElement(){
    const totalScoreDisplay = document.createElement("h1");
    totalScoreDisplay.classList.add("osszpontszam-kijelzo");
    totalScoreDisplay.innerText = "Összesített pontszám: 0";
    return totalScoreDisplay;
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
function updateScore(currentScoreElement,totalScoreElement, value, isAdding, ID) {
    let currentScore = playersData[ID].points
    let totalScore = playersData[ID].totalPoints
    const amount = parseInt(value);

    // Globális és helyi változók frissítése
    if (isAdding) {
        currentScore += amount;
        totalScore += amount;
        playersData[ID].points += amount;
    } else {
        currentScore -= amount;
        totalScore -= amount;
        playersData[ID].points -= amount;
    }
    playersData[ID].totalPoints = totalScore;

    console.log(`Játékos: ${playersData[ID].name} Pontjai: ${playersData[ID].points} Összes: ${playersData[ID].totalPoints}`)

    // UI és adat attribútum frissítése
    currentScoreElement.innerText = `Pontszám: ${currentScore}`;
    totalScoreElement.innerText = `Összesített Pontszám: ${totalScore}`
    
    console.log("Összesített globális pont:", countPlayersPoints());
}

function countPlayersPoints(){
    let total = 0;
    for(let i = 0; i < JATEKOSOK_SZAMA; i++){
        total += playersData[i].points;
    }
    console.log(playersData);
    return total
}

function clearPlayersPoints(){
        for(let i = 0; i < JATEKOSOK_SZAMA; i++){
        playersData[i].points = 0;
    }
}

// Rögzítés és ellenőrzés
function pin() {
    const totalPoint = countPlayersPoints();
    const errorBox = document.querySelector(".errorOutput");
    if(errorBox){
        errorBox.style.display = "none";
    }
    if (totalPoint < CEL_PONTSZAM) {
        errorOutputText("Az összesített pontszám kisebb, mint 250! (Jelenleg: " + totalPoint + ")");
        return;
    } else if (totalPoint > CEL_PONTSZAM) {
        errorOutputText("Az összesített pontszám nagyobb, mint 250! (Jelenleg: " + totalPoint + ")");
        return;
    }

    // Ha pontosan 250, akkor reseteljük a gombok kinézetét
    const allPointButtons = document.getElementsByClassName("pontDiv");
    for (let btn of allPointButtons) {
        btn.classList.remove("kivalasztva");
    }

    updateRoundResultDisplay();

    // Utolsó kör
    if(currRound == maxRounds){
        gameEnd()
        return
    }

    currRound++;
    updateRoundDisplay();
    clearPlayersPoints();
    updateAllPlayersCountDisplay();
}
function errorOutputText(text){
    const errorBox = document.querySelector(".errorOutput")
    errorBox.innerText = text;
    errorBox.style.display = "block";
}
// Megkeresi a vesztest a körben
function findLoser(){
    let loser = playersData[0];
    let PlayerContainer = document.querySelector(`.jatekos${roundLoserID}`);
    PlayerContainer.classList.remove("roundLoser");

    for(let i = 1; i < playersData.length;i++){
        if(loser.points < playersData[i].points )
            loser = playersData[i];
    }

    playerContainer = document.querySelector(`.jatekos${loser.id}`);
    playerContainer.classList.add("roundLoser");

    roundLoserID = loser.id;
    return loser;
}
// Összeállítja a kör végeredményét
function createRoundResult(loser){
    let result = "";
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
// Játék vége
function gameEnd(){
    let gameLoser = playersData[0];

    for(let i = 1; i < playersData.length;i++){
        if(gameLoser.totalPoints < playersData[i].totalPoints )
            gameLoser = playersData[i];
    }

    document.querySelector(`.jatekos${roundLoserID}`).classList.remove("roundLoser");
    let playerContainer = document.querySelector(`.jatekos${gameLoser.id}`);
    playerContainer.classList.add("gameLoser");
    let pinBTN = document.getElementById("pinBtn");
    pinBTN.value = "Új játék" ;
    pinBTN.onclick = resetGame;

}

function resetGame(){
    window.location.href = "index.html"
}