document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultScreen = document.getElementById('result-screen');
    const startBtn = document.getElementById('start-btn');
    const questionText = document.getElementById('question-text');
    const answersContainer = document.getElementById('answers-container');
    const resultText = document.getElementById('result-text');
    const retryBtn = document.getElementById('retry-btn');

    const questions = [
        {
            text: "어떤 종류의 음식을 선호하시나요? (복수선택 가능)",
            answers: ["한식", "일식", "중식", "양식"],
            multiple: true,
        },
        {
            text: "주재료는 무엇이 좋을까요? (복수선택 가능)",
            answers: ["밀가루", "쌀", "메밀"],
            multiple: true,
        },
        {
            text: "어떤 맛을 선호하시나요? (복수선택 가능)",
            answers: ["신맛", "짠맛", "단맛", "쓴맛", "감칠맛"],
            multiple: true,
        },
        {
            text: "맵기는 어느 정도가 좋을까요?",
            answers: ["안매운맛", "조금 매운맛", "매운맛", "아주 매운맛"],
            multiple: false,
        },
        {
            text: "면 요리를 드시겠어요?",
            answers: ["네", "아니오"],
            multiple: false,
        }
    ];

    const menu = [
        { name: "김치찌개", cuisine: "한식", ingredient: "쌀", flavor: ["짠맛", "신맛", "감칠맛"], spicy: "매운맛", noodle: "아니오" },
        { name: "된장찌개", cuisine: "한식", ingredient: "쌀", flavor: ["짠맛", "감칠맛"], spicy: "조금 매운맛", noodle: "아니오" },
        { name: "초밥", cuisine: "일식", ingredient: "쌀", flavor: ["감칠맛", "단맛", "신맛"], spicy: "안매운맛", noodle: "아니오" },
        { name: "라멘", cuisine: "일식", ingredient: "밀가루", flavor: ["짠맛", "감칠맛"], spicy: "조금 매운맛", noodle: "네" },
        { name: "짜장면", cuisine: "중식", ingredient: "밀가루", flavor: ["단맛", "짠맛"], spicy: "안매운맛", noodle: "네" },
        { name: "짬뽕", cuisine: "중식", ingredient: "밀가루", flavor: ["짠맛", "감칠맛"], spicy: "매운맛", noodle: "네" },
        { name: "파스타", cuisine: "양식", ingredient: "밀가루", flavor: ["신맛", "짠맛", "감칠맛"], spicy: "안매운맛", noodle: "네" },
        { name: "스테이크", cuisine: "양식", ingredient: "고기", flavor: ["짠맛", "감칠맛"], spicy: "안매운맛", noodle: "아니오" },
        { name: "냉면", cuisine: "한식", ingredient: "메밀", flavor: ["신맛", "단맛"], spicy: "조금 매운맛", noodle: "네" },
        { name: "비빔밥", cuisine: "한식", ingredient: "쌀", flavor: ["단맛", "감칠맛"], spicy: "조금 매운맛", noodle: "아니오" },
    ];

    let currentQuestionIndex = 0;
    let userAnswers = [];

    startBtn.addEventListener('click', startQuiz);
    retryBtn.addEventListener('click', retryQuiz);

    function startQuiz() {
        startScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');
        currentQuestionIndex = 0;
        userAnswers = [];
        showQuestion();
    }

    function showQuestion() {
        const question = questions[currentQuestionIndex];
        questionText.textContent = question.text;
        answersContainer.innerHTML = '';

        const selectedAnswers = [];

        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.addEventListener('click', () => {
                if (question.multiple) {
                    button.classList.toggle('selected');
                    if (selectedAnswers.includes(answer)) {
                        selectedAnswers.splice(selectedAnswers.indexOf(answer), 1);
                    } else {
                        selectedAnswers.push(answer);
                    }
                } else {
                    userAnswers[currentQuestionIndex] = [answer];
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        showQuestion();
                    } else {
                        showResult();
                    }
                }
            });
            answersContainer.appendChild(button);
        });

        if (question.multiple) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '다음';
            nextButton.id = 'next-btn';
            nextButton.addEventListener('click', () => {
                userAnswers[currentQuestionIndex] = selectedAnswers;
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    showQuestion();
                } else {
                    showResult();
                }
            });
            answersContainer.appendChild(nextButton);
        }
    }

    function getObjectMarker(name) {
        const lastChar = name.charCodeAt(name.length - 1);
        if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
            const hasJongseong = (lastChar - 0xAC00) % 28 > 0;
            return hasJongseong ? '을' : '를';
        }
        return '을';
    }

    function showResult() {
        questionScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        let bestMatch = null;
        let maxScore = -1;

        menu.forEach(item => {
            let score = 0;
            // 1. Cuisine
            if (userAnswers[0] && userAnswers[0].includes(item.cuisine)) {
                score++;
            }
            // 2. Ingredient
            if (userAnswers[1] && userAnswers[1].includes(item.ingredient)) {
                score++;
            }
            // 3. Flavor
            if (userAnswers[2]) {
                userAnswers[2].forEach(flavor => {
                    if (item.flavor.includes(flavor)) {
                        score++;
                    }
                });
            }
            // 4. Spicy
            if (userAnswers[3] && userAnswers[3][0] === item.spicy) {
                score++;
            }
            // 5. Noodle
            if (userAnswers[4] && userAnswers[4][0] === item.noodle) {
                score++;
            }

            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        });

        if (bestMatch) {
            const objectMarker = getObjectMarker(bestMatch.name);
            resultText.textContent = `렘이 ${bestMatch.name}${objectMarker} 추천해드릴게요!`;
            const resultLink = document.getElementById('result-link');
            resultLink.href = `https://www.google.com/search?q=${bestMatch.name}`;
        } else {
            resultText.textContent = "추천할 메뉴를 찾지 못했어요. 다시 시도해보세요!";
        }
    }

    function retryQuiz() {
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }
});
