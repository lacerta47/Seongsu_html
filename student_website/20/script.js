// 안녕하세요! 이 목록에 있는 아이돌의 사진을 바꾸고 싶으시면 아래 방법을 따라해 보세요.
// 1. 구글 같은 검색 엔진에서 원하는 아이돌의 사진을 찾으세요.
// 2. 마음에 드는 사진 위에서 마우스 오른쪽 버튼을 클릭하세요.
// 3. 메뉴에서 '이미지 주소 복사' 또는 'Copy Image Address'를 선택하세요.
// 4. 아래 목록에서 사진을 바꾸고 싶은 아이돌을 찾으세요.
// 5. 'src:' 뒤에 있는 따옴표(') 안의 주소(https://...)를 지우고, 방금 복사한 새 이미지 주소를 붙여넣으세요.
// 6. 파일을 저장하면 게임에 바꾼 사진이 나타날 거예요!

const idols = [
    { name: '카리나', src: 'https://via.placeholder.com/300x300.png?text=Karina' },
    { name: '윈터', src: 'https://via.placeholder.com/300x300.png?text=Winter' },
    { name: '장원영', src: 'https://via.placeholder.com/300x300.png?text=Jang+Wonyoung' },
    { name: '안유진', src: 'https://via.placeholder.com/300x300.png?text=An+Yujin' },
    { name: '민지', src: 'https://via.placeholder.com/300x300.png?text=Minji' },
    { name: '해린', src: 'https://via.placeholder.com/300x300.png?text=Haerin' },
    { name: '사쿠라', src: 'https://via.placeholder.com/300x300.png?text=Sakura' },
    { name: '김채원', src: 'https://via.placeholder.com/300x300.png?text=Kim+Chaewon' },
    { name: '지수', src: 'https://via.placeholder.com/300x300.png?text=Jisoo' },
    { name: '제니', src: 'https://via.placeholder.com/300x300.png?text=Jennie' },
    { name: '로제', src: 'https://via.placeholder.com/300x300.png?text=Rose' },
    { name: '리사', src: 'https://via.placeholder.com/300x300.png?text=Lisa' },
    { name: '하니', src: 'https://via.placeholder.com/300x300.png?text=Hanni' },
    { name: '다니엘', src: 'https://via.placeholder.com/300x300.png?text=Danielle' },
    { name: '혜인', src: 'https://via.placeholder.com/300x300.png?text=Hyein' },
    { name: '가을', src: 'https://via.placeholder.com/300x300.png?text=Gaeul' },
    { name: '레이', src: 'https://via.placeholder.com/300x300.png?text=Rei' },
    { name: '리즈', src: 'https://via.placeholder.com/300x300.png?text=Liz' },
    { name: '이서', src: 'https://via.placeholder.com/300x300.png?text=Leeseo' },
    { name: '나연', src: 'https://via.placeholder.com/300x300.png?text=Nayeon' },
    { name: '정연', src: 'https://via.placeholder.com/300x300.png?text=Jeongyeon' },
    { name: '모모', src: 'https://via.placeholder.com/300x300.png?text=Momo' },
    { name: '사나', src: 'https://via.placeholder.com/300x300.png?text=Sana' },
    { name: '지효', src: 'https://via.placeholder.com/300x300.png?text=Jihyo' },
    { name: '미나', src: 'https://via.placeholder.com/300x300.png?text=Mina' },
    { name: '다현', src: 'https://via.placeholder.com/300x300.png?text=Dahyun' },
    { name: '채영', src: 'https://via.placeholder.com/300x300.png?text=Chaeyoung' },
    { name: '쯔위', src: 'https://via.placeholder.com/300x300.png?text=Tzuyu' },
    { name: '허윤진', src: 'https://via.placeholder.com/300x300.png?text=Huh+Yunjin' },
    { name: '카즈하', src: 'https://via.placeholder.com/300x300.png?text=Kazuha' },
    { name: '홍은채', src: 'https://via.placeholder.com/300x300.png?text=Hong+Eunchae' },
    { name: '미연', src: 'https://via.placeholder.com/300x300.png?text=Miyeon' },
    { name: '민니', src: 'https://via.placeholder.com/300x300.png?text=Minnie' },
    { name: '소연', src: 'https://via.placeholder.com/300x300.png?text=Soyeon' },
    { name: '우기', src: 'https://via.placeholder.com/300x300.png?text=Yuqi' },
    { name: '슈화', src: 'https://via.placeholder.com/300x300.png?text=Shuhua' },
    { name: '지젤', src: 'https://via.placeholder.com/300x300.png?text=Giselle' },
    { name: '닝닝', src: 'https://via.placeholder.com/300x300.png?text=Ningning' },
    { name: '루카', src: 'https://via.placeholder.com/300x300.png?text=Ruka' },
    { name: '파리타', src: 'https://via.placeholder.com/300x300.png?text=Pharita' },
    { name: '아사', src: 'https://via.placeholder.com/300x300.png?text=Asa' },
    { name: '아현', src: 'https://via.placeholder.com/300x300.png?text=Ahyeon' },
    { name: '라미', src: 'https://via.placeholder.com/300x300.png?text=Rami' },
    { name: '로라', src: 'https://via.placeholder.com/300x300.png?text=Rora' },
    { name: '치키타', src: 'https://via.placeholder.com/300x300.png?text=Chiquita' },
    { name: '윤아', src: 'https://via.placeholder.com/300x300.png?text=Yuna' },
    { name: '민주', src: 'https://via.placeholder.com/300x300.png?text=Minju' },
    { name: '모카', src: 'https://via.placeholder.com/300x300.png?text=Moka' },
    { name: '원희', src: 'https://via.placeholder.com/300x300.png?text=Wonhee' },
    { name: '이로하', src: 'https://via.placeholder.com/300x300.png?text=Iroha' },
    { name: '예지', src: 'https://via.placeholder.com/300x300.png?text=Yeji' },
    { name: '리아', src: 'https://via.placeholder.com/300x300.png?text=Lia' },
    { name: '류진', src: 'https://via.placeholder.com/300x300.png?text=Ryujin' },
    { name: '채령', src: 'https://via.placeholder.com/300x300.png?text=Chaeryeong' },
    { name: '유나', src: 'https://via.placeholder.com/300x300.png?text=Yuna' },
    { name: '아이린', src: 'https://via.placeholder.com/300x300.png?text=Irene' },
    { name: '슬기', src: 'https://via.placeholder.com/300x300.png?text=Seulgi' },
    { name: '웬디', src: 'https://via.placeholder.com/300x300.png?text=Wendy' },
    { name: '조이', src: 'https://via.placeholder.com/300x300.png?text=Joy' },
    { name: '예리', src: 'https://via.placeholder.com/300x300.png?text=Yeri' },
    { name: '효정', src: 'https://via.placeholder.com/300x300.png?text=Hyojung' },
    { name: '미미', src: 'https://via.placeholder.com/300x300.png?text=Mimi' },
    { name: '유아', src: 'https://via.placeholder.com/300x300.png?text=YooA' },
    { name: '승희', src: 'https://via.placeholder.com/300x300.png?text=Seunghee' }
];

let currentRound = 0;
let currentMatch = [];
let winners = [];

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const roundTitle = document.getElementById('round-title');
const imgLeft = document.getElementById('img-left');
const nameLeft = document.getElementById('name-left');
const btnLeft = document.getElementById('btn-left');
const imgRight = document.getElementById('img-right');
const nameRight = document.getElementById('name-right');
const btnRight = document.getElementById('btn-right');

const winnerImg = document.getElementById('winner-img');
const winnerName = document.getElementById('winner-name');
const restartBtn = document.getElementById('restart-btn');

document.querySelectorAll('.round-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const round = parseInt(e.target.dataset.round);
        startGame(round);
    });
});

function startGame(round) {
    currentRound = round;
    winners = [];
    
    let fighters = [...idols].sort(() => 0.5 - Math.random()).slice(0, currentRound);
    
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    startNewRound(fighters);
}

function startNewRound(fighters) {
    currentMatch = fighters;
    winners = [];
    roundTitle.innerText = currentRound === 2 ? '결승' : `${currentRound}강`;
    displayNextMatch();
}

function displayNextMatch() {
    if (currentMatch.length === 0) {
        if (winners.length === 1) {
            // 최종 우승
            showWinner();
            return;
        }
        // 다음 라운드 시작
        currentRound /= 2;
        startNewRound(winners);
        return;
    }

    const leftFighter = currentMatch.pop();
    const rightFighter = currentMatch.pop();

    imgLeft.src = leftFighter.src;
    nameLeft.innerText = leftFighter.name;
    btnLeft.onclick = () => selectFighter(leftFighter);

    imgRight.src = rightFighter.src;
    nameRight.innerText = rightFighter.name;
    btnRight.onclick = () => selectFighter(rightFighter);
}

function selectFighter(winner) {
    winners.push(winner);
    displayNextMatch();
}

function showWinner() {
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const finalWinner = winners[0];
    winnerImg.src = finalWinner.src;
    winnerName.innerText = finalWinner.name;
}

restartBtn.addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});