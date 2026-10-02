// Dán 4 link CSV của bạn vào đây
const CSV_SOURCES = {
    topic1: "Trắc nghiệm Bột pha uống Vinalink.csv", 
    topic2: "Trắc nghiệm Chiến lược Sản phẩm.csv",
    topic3: "Trắc nghiệm Mỹ phẩm Vxebra.csv",
    topic4: "Trắc nghiệm Sản phẩm Mới.csv"
};

// Các biến trạng thái
let allQuestions = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongAnswers = [];

// DOM Elements
const screens = {
    topic: document.getElementById('topic-screen'),
    loading: document.getElementById('loading-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen')
};

// Hàm chuyển màn hình
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// Bắt sự kiện chọn chủ đề
document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const topicKey = e.target.getAttribute('data-topic');
        const url = CSV_SOURCES[topicKey];
        loadDataAndStart(url);
    });
});

// Tải dữ liệu từ Google Sheets
function loadDataAndStart(csvUrl) {
    showScreen('loading');
    
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            // Lọc bỏ các dòng trống
            allQuestions = results.data.filter(q => q.Question && q.Question.trim() !== "");
            
            if(allQuestions.length === 0) {
                alert("Không có câu hỏi nào trong chủ đề này. Hãy kiểm tra lại file Sheets.");
                showScreen('topic');
                return;
            }

            // Xáo trộn và lấy 10 câu (nếu kho có ít hơn 10 câu thì lấy tất cả)
            const shuffled = shuffleArray([...allQuestions]);
            currentQuiz = shuffled.slice(0, 10); 
            
            currentQuestionIndex = 0;
            score = 0;
            wrongAnswers = [];
            
            showScreen('quiz');
            renderQuestion();
        },
        error: function(err) {
            alert("Lỗi tải dữ liệu. Hãy kiểm tra lại link CSV.");
            showScreen('topic');
            console.error(err);
        }
    });
}

// Xáo trộn mảng
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Hiển thị câu hỏi
function renderQuestion() {
    const q = currentQuiz[currentQuestionIndex];
    
    document.getElementById('progress-text').innerText = `Câu ${currentQuestionIndex + 1}/${currentQuiz.length}`;
    document.getElementById('progress-bar').style.width = `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%`;
    document.getElementById('question-text').innerText = q.Question;
    
    const btnA = document.getElementById('option-a');
    const btnB = document.getElementById('option-b');
    
    btnA.innerText = `A. ${q.OptionA}`;
    btnB.innerText = `B. ${q.OptionB}`;
    
    btnA.onclick = () => handleAnswer('A');
    btnB.onclick = () => handleAnswer('B');
}

// Xử lý khi chọn đáp án
function handleAnswer(selected) {
    const q = currentQuiz[currentQuestionIndex];
    const correct = q.CorrectAnswer.trim().toUpperCase();

    if (selected === correct) {
        score++;
    } else {
        wrongAnswers.push({
            question: q.Question,
            selectedText: selected === 'A' ? q.OptionA : q.OptionB,
            correctText: correct === 'A' ? q.OptionA : q.OptionB,
            explanation: q.Explanation
        });
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuiz.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

// Hiển thị kết quả
function showResults() {
    document.getElementById('score-text').innerText = score;
    const reviewContainer = document.getElementById('wrong-answers-list');
    reviewContainer.innerHTML = ''; 

    if (wrongAnswers.length === 0) {
        reviewContainer.innerHTML = "<p>Tuyệt vời! Bạn đã trả lời đúng tất cả các câu.</p>";
    } else {
        wrongAnswers.forEach(item => {
            const div = document.createElement('div');
            div.className = 'review-item';
            div.innerHTML = `
                <h4>${item.question}</h4>
                <div class="review-wrong">❌ Bạn chọn: ${item.selectedText}</div>
                <div class="review-correct">✅ Đáp án đúng: ${item.correctText}</div>
                <div class="review-exp">💡 Giải thích: ${item.explanation}</div>
            `;
            reviewContainer.appendChild(div);
        });
    }

    showScreen('result');
}

// Nút quay lại màn hình chọn chủ đề
document.getElementById('restart-btn').addEventListener('click', () => {
    showScreen('topic');
});
