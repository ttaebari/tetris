import BLOCKS from "./blocks.js"

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const startText = document.querySelector(".start")
const scoreDisplay = document.querySelector(".score");
const startButton = document.querySelector(".start > button")
const restartButton = document.querySelector(".game-text > button")


// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingitem;


const MovingItem = {
    type : "",
    direction : 0,
    top : 0,
    left : 0,
};


// functions
function init(){
    tempMovingitem = { ...MovingItem}; //전체 복사가 아닌 안에 들어간 값만 복사
    for(let i=0; i < GAME_ROWS; i++){
        prependNewLine()
    }
    generateNewBlock()
}


function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j<GAME_COLS ; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix)
    }
    li.prepend(ul)
    playground.prepend(li)
}

function renderBlocks(moveType = ""){
    const {type, direction, top, left} = tempMovingitem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving =>{
        moving.classList.remove(type,"moving")
    })
    BLOCKS[type][direction].some(block => { //원래는 foreach이나 중간에 멈추기 위해 some 사용
        const x = block[0] + left;
        const y = block[1] + top;
        // const xxx = 조건 ? 참일경우 : 거짓일경우
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable){
            target.classList.add(type, "moving")
        }else {
            //재귀함수의 stackoverflow때문에 timeout 사용
            tempMovingitem = { ...MovingItem};
            if(moveType === 'retry'){
                clearInterval(downInterval);
                showGameoverText()
            }
            setTimeout(() =>{
                renderBlocks('retry');
                if(moveType ==="top"){
                    seizeBlock();
                }
            },0)
            return true;//중지를 위한 리턴 true
        }
    });
    MovingItem.left = left;
    MovingItem.top = top;
    MovingItem.direction = direction;
}

function showGameoverText(){
    gameText.style.display = "flex"
}

function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving =>{
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
}

function checkMatch(){

    const childNodes = playground.childNodes;
    childNodes.forEach(child =>{
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText = score;
        }
    })
    generateNewBlock()
}

function generateNewBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top",1)
    },duration)
    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    MovingItem.type = blockArray[randomIndex][0];
    MovingItem.top = 0;
    MovingItem.left = 3;
    MovingItem.direction = 0;
    tempMovingitem = { ...MovingItem};
    renderBlocks()
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true
}

function moveBlock(moveType, amount){
    tempMovingitem[moveType] += amount
    renderBlocks(moveType)
}

function changeDirection(){
    const direction = tempMovingitem.direction ;
    direction === 3 ? tempMovingitem.direction = 0 : tempMovingitem.direction += 1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top",1)
    },20)
}


// evnet handling
document.addEventListener("keydown", e => {
    switch(e.keyCode){
        case 39: //오른쪽
            moveBlock("left",1)
            break;
        case 37: //왼쪽
            moveBlock("left", -1)
            break;
        case 40: //아래쪽
            moveBlock("top", 1)
            break;
        case 38: //위쪽
            changeDirection();   
            break;
        case 32: //스페이스바
            dropBlock();
            break;
        default:
            break;
    }
})

restartButton.addEventListener("click",()=>{
    playground.innerHTML = "";
    gameText.style.display = "none"
    init();
})

startButton.addEventListener("click",()=>{
    init();
    startText.style.display = "none"
})