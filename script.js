// HTML요소에 대한 정보 불러오기
const container = document.querySelector("#container");
const tileWrapper = document.querySelector(".tile_wrapper");
const levelElem = document.querySelector(".level");
const resetBtn = document.querySelector(".reset");
const timerElem = document.querySelector(".timer");
let pushColor = "#ffb800";

// 타일 배열의 최외각 배열 선언
let tileArr = [];

// 복제될 타일 생성
const tile = document.createElement("div");
tile.classList.add("tile");

// 난이토 초기 세팅
let saveLevel = "EASY";

// 타이머 초기 세팅
let time = 0;
let timerTrigger = null;

// 게임 오버 시, 클릭 금지 블록 생성
let blockElem = null;


// 난이도에 따른 각각의 정보 세팅
//level: [row, col, mine]
const level = {
    EASY: [9, 9, 10],
    NORMAL: [16, 16, 40],
    HARD: [30, 16, 99]
}

// 타일 생성 ( css조작 / 타일 삽입 / 배열 생성 / 지뢰 생성 / 지뢰 주변 숫자 설정)
function setTile([row, col, mine]) {
    let countArr = 0;
    tileArr = [];

    tileWrapper.style.gridTemplateColumns = `repeat(${row}, 1fr)`;
    tileWrapper.style.gridTemplateRows = `repeat(${col}, 1fr)`;

    for (let i = 0; i < col; i++) {
        tileArr.push([]);

        while (tileArr[i].length < row) {
            tileArr[i].push(0);
            tileWrapper.appendChild(tile.cloneNode(false));
        }
    }

    for (let i = 0; i < mine; i++) {
        let x = Math.floor(Math.random() * row);
        let y = Math.floor(Math.random() * col);

        if (tileArr[y][x] === "●") {
            i--;
        } else {
            tileArr[y][x] = "●";
            countMines(x, y, row - 1, col - 1, tileArr);
        }
    }

    for (let i = 0; i < col; i++) {
        for (let j = 0; j < row; j++) {
            tileWrapper.childNodes[countArr].innerHTML = `<p class="TXT${tileArr[i][j]}">${tileArr[i][j]}</p>`
            countArr++;
        }
    }

    timerTrigger = false;
    time = 0;
    timerElem.innerHTML = time;
    console.log(tileArr);
}

// 지뢰 주변 숫자 설정
function countMines(x, y, row, col, tileArr) {
    let iEnd = y + 2;
    let jEnd = x + 2;

    for (let i = y - 1; i < iEnd; i++) {
        for (let j = x - 1; j < jEnd; j++) {
            if (j < 0 || i < 0 || j > row || i > col || (tileArr[i][j] === "●")) {
                continue;
            } else {
                tileArr[i][j] += 1;
            }
        }
    }
}

// 처음 시작
setTile(level.EASY);

// 타일 삭제
function clearTile() {
    tileWrapper.innerHTML = null;
}

// 난이도 설정 (타일 삭제)
function levelHandler(e) {
    if (container.childNodes[9]) {
        container.removeChild(container.childNodes[9]);
    }

    let currnetLevel = e.target.textContent;

    if (e.target.className === "level") {
        true;
    }
    else if (e.target.className === "reset") {
        clearTile();
        (saveLevel === "EASY") ? setTile(level.EASY) : setTile(level[saveLevel]);
    }
    else {
        clearTile();
        saveLevel = currnetLevel;
        setTile(level[currnetLevel]);
    }
}

levelElem.addEventListener("click", levelHandler);
resetBtn.addEventListener("click", levelHandler);

// 타일 클릭 (타일 숫자 표시, 타이머 시작)
function clickHandler(e) {
    (e.target.classList.contains("click") || e.target.classList.contains("tile_wrapper")) ? true : e.target.childNodes[0].classList.add("click");

    // 타이머
    if (timerTrigger === false) {
        timerTrigger = true;

        let timer = setInterval(() => {
            (timerTrigger === false && time === 0) ? clearInterval(timer) : timerElem.innerText = time++;
        }, 1000);
    }

    for (let i = 0; i < tileWrapper.childNodes.length; i++) {
        if (e.target === tileWrapper.childNodes[i]) {
            let y = Math.floor(i / tileArr[0].length);
            let x = i - (y * tileArr[0].length);

            e.target.style.backgroundColor = pushColor;
            if (e.target.childNodes[0].textContent === "●") gameOver();
            else if (e.target.childNodes[0].textContent === "0") {
                e.target.childNodes[0].textContent = "";
                openTile(x, y);
            }
            else true;
        }
        else true;
    }

    gameClear();
}

function gameClear() {
    let gameClearTrigger = 0;

    for (let i = 0; i < tileWrapper.childNodes.length; i++) {
        (tileWrapper.childNodes[i].childNodes[0].classList.contains("click")) ? gameClearTrigger++ : true;
    }

    if (gameClearTrigger === 71 || gameClearTrigger === 216 || gameClearTrigger === 318) {
        gameOver(gameClearTrigger);
    }
}

// 지뢰 탐지
function openTile(x, y) {
    if (tileArr[y][x] === 0) tileArr[y][x] = "";
    let iEnd = y + 2;
    let jEnd = x + 2;


    for (let i = y - 1; i < iEnd; i++) {
        for (let j = x - 1; j < jEnd; j++) {
            if (j < 0 || i < 0 || j > (tileArr[0].length - 1) || i > (tileArr.length - 1) || (i === y && j === x)) {
                continue;
            }
            else {
                let arrNum = 0;
                if (tileArr[0].length === 9) arrNum = 10 * i - (i - j);
                else if (tileArr[0].length === 16) arrNum = 17 * i - (i - j);
                else if (tileArr[0].length === 30) arrNum = 30 * i + j;
                let numElem = tileWrapper.childNodes[arrNum];

                if (!numElem.childNodes[0].classList.contains("click")) {
                    numElem.childNodes[0].classList.add("click");;
                    numElem.style.backgroundColor = pushColor;
                }

                if (tileArr[i][j] === 0) {
                    numElem.childNodes[0].textContent = "";
                    openTile(j, i);
                }

            }
        }
    }
}

function gameOver(trigger) {
    blockElem = document.createElement("div");
    blockElem.classList.add("block");

    if (tileArr[0].length === 9) blockElem.classList.add("easy_block");
    else if (tileArr[0].length === 16) blockElem.classList.add("normal_block");
    else if (tileArr[0].length === 30) blockElem.classList.add("hard_block");

    if (trigger === 71 || trigger === 216 || trigger === 318) {
        blockElem.style.color = "#26ff00";
        if (matchMedia("screen and (max-width: 1183px)").matches) blockElem.innerText = `[ CONGRATULATION! ] \n Record: ${time}s \n PC has another Level!`;
        else blockElem.innerText = `[ CONGRATULATION! ] \n Record: ${time}s`;
    } else {
        if (matchMedia("screen and (max-width: 1183px)").matches) blockElem.innerText = `[ GAME OVER! ] \n Record: ${time}s \n PC has another Level!`;
        else blockElem.innerText = `[ GAME OVER! ] \n Record: ${time}s`;
    }

    container.appendChild(blockElem);
}

tileWrapper.addEventListener("mousedown", clickHandler);