// HTML요소에 대한 정보 불러오기
const tileWrapper = document.querySelector(".tile_wrapper");
const levelElem = document.querySelector(".level");
const resetBtn = document.querySelector(".reset");
const timerBtn = document.querySelector(".timer");
let pushColor = "#ffb800";

// 타일 배열의 최외각 배열 선언
let tileArr = [];

// 복제될 타일 생성
let tile = document.createElement("div");
tile.classList.add("tile");

// 난이토 초기 세팅
let saveLevel = "EASY";

// 타이머 초기 세팅
let time = 0;
let timerTrigger = null;

// 난이도에 따른 각각의 정보 세팅
//level: [row, col, mine, flag]
const level = {
    EASY: [9, 9, 10, 10],
    NORMAL: [16, 16, 40, 40],
    HARD: [30, 16, 99, 99]
}

// 타일 생성 ( css조작 / 타일 삽입 / 배열 생성 / 지뢰 생성 / 지뢰 주변 숫자 설정)
function setTile([row, col, mine, flag]) {
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
    timerBtn.innerHTML = time;
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
            (timerTrigger === false && time === 0) ? clearInterval(timer) : timerBtn.innerText = time++;
        }, 1000);
    }

    for (let i = 0; i < tileWrapper.childNodes.length; i++) {
        if (e.target === tileWrapper.childNodes[i]) {
            let y = Math.floor(i / tileArr[0].length);
            let x = i - (y * tileArr[0].length);

            e.target.style.backgroundColor = pushColor;
            if (e.target.childNodes[0].textContent === "●") console.log("게임 끝!");
            else if (e.target.childNodes[0].textContent === "0") openTile(x, y);
            else true;
        }
        else true;
    }
}

// 지뢰 탐지
function openTile(x, y) {
    if (tileArr[y][x] === 0) tileArr[y][x] = ""
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
                    openTile(j, i);
                }

            }
        }
    }
}

tileWrapper.addEventListener("mousedown", clickHandler);

/*
    1. 클릭한 타일의 주변 8칸을 살펴볼 것.
    2-1. 근처에 지뢰가 없다 -> 주변 8칸을 돌아가며 다른 주변 8칸을 조사한다.
    2-2. 근처에 지뢰가 있다 -> 해당 칸만 오픈한다.
    2-3. 지뢰를 누름 -> 게임 끝남
*/

// 객체리터럴의 키값을 가져올 때 키 값을 변수명으로 불러오려고 하면 undifined라고 뜬다.

// 한줄짜리 함수
// 한줄짜리 조건문 및 반복문

// 삼함연산자 실수 (지뢰가 랜럼으로 같은 값일때도 주변에 숫자를 더해줌)

// setInterval clearInterval

// const level = new Map();
// level.set("EASY", [9, 9]);
// level.set("NORMAL", [16, 16]);
// level.set("HARD", [16, 30]);

/*
    만들어야 할 것
    2. 게임오버
    3. 승리시 창
    4. 우클릭 깃발

    //
    타일안에 카운트 값을 넣어둔 다음 감춰놓음
    클릭시 드러냄
    0인것은 그대로 나두고 색상만 변경(class이용)

    // 타이머 조절
*/
