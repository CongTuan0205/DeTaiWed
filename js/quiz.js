// [BỔ SUNG MỚI] Ngân hàng câu hỏi mặc định có hỗ trợ thêm Lời giải chi tiết (explanation) và Ảnh minh họa (image)
const defaultQuestionBank = [
  // LỊCH SỬ
  { id: 101, subject: "history", question: "Chiến thắng Điện Biên Phủ diễn ra vào năm nào?", answers: ["1945", "1954", "1968", "1975"], correct: 1, explanation: "Chiến thắng Điện Biên Phủ diễn ra từ ngày 13/03/1954 đến ngày 07/05/1954." },
  { id: 102, subject: "history", question: "Chủ tịch Hồ Chí Minh đọc Bản Tuyên ngôn Độc lập tại đâu?", answers: ["Phủ Chủ Tịch", "Quảng trường Ba Đình", "Bến Nhà Rồng", "Tân Trào"], correct: 1, explanation: "Ngày 02/09/1945, Bác Hồ đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, Hà Nội." },
  { id: 103, subject: "history", question: "Tên gọi đầu tiên của nước ta thời Hùng Vương là gì?", answers: ["Đại Việt", "Đại Cồ Việt", "Văn Lang", "Âu Lạc"], correct: 2, explanation: "Văn Lang là nhà nước đầu tiên của người Việt trong lịch sử." },
  { id: 104, subject: "history", question: "Triều đại phong kiến cuối cùng của Việt Nam là triều đại nào?", answers: ["Nhà Lê", "Nhà Tây Sơn", "Nhà Nguyễn", "Nhà Lý"], correct: 2, explanation: "Nhà Nguyễn (1802 - 1945) là triều đại phong kiến cuối cùng trong lịch sử Việt Nam." },
  
  // ĐỊA LÝ
  { id: 201, subject: "geography", question: "Đỉnh núi nào được mệnh danh là 'Nóc nhà Đông Dương'?", answers: ["Phan-xi-păng", "Mẫu Sơn", "Bà Đen", "Ngọc Linh"], correct: 0, explanation: "Đỉnh Phan-xi-păng cao 3.143m thuộc dãy Hoàng Liên Sơn." },
  { id: 202, subject: "geography", question: "Thành phố nào là trung tâm kinh tế lớn nhất Việt Nam?", answers: ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh", "Cần Thơ"], correct: 2, explanation: "TP. Hồ Chí Minh là đầu tàu kinh tế, trung tâm văn hóa, giáo dục lớn nhất cả nước." },
  { id: 203, subject: "geography", question: "Việt Nam nằm ở khu vực nào thuộc châu Á?", answers: ["Đông Á", "Đông Nam Á", "Nam Á", "Tây Nam Á"], correct: 1, explanation: "Việt Nam thuộc khu vực Đông Nam Á (bán đảo Đông Dương)." },
  { id: 204, subject: "geography", question: "Sông nào dài nhất chảy qua lãnh thổ Việt Nam?", answers: ["Sông Hồng", "Sông Cửu Long", "Sông Đồng Nai", "Sông Đà"], correct: 1, explanation: "Sông Cửu Long (Mê Kông) có chiều dài chảy qua Việt Nam lớn nhất và vùng đồng bằng rộng lớn." }
];

// [BỔ SUNG MỚI] Bảo mật: Mã hóa nhẹ chỉ số đáp án đúng (Base64) để chống lộ đáp án khi xem DevTools/localStorage
function encodeCorrectAnswer(correctIdx) {
  try {
    return btoa("ANS_" + correctIdx);
  } catch (e) {
    return correctIdx;
  }
}

function decodeCorrectAnswer(encoded) {
  try {
    if (typeof encoded === 'string' && encoded.startsWith("QU5TXw==")) { // Mã hóa Base64 của ANS_
      const decodedStr = atob(encoded);
      return parseInt(decodedStr.replace("ANS_", ""));
    }
    return typeof encoded === 'string' ? parseInt(encoded) : encoded;
  } catch (e) {
    return parseInt(encoded);
  }
}

function getFullQuestionBank() {
  const customQuestions = JSON.parse(localStorage.getItem('customQuestionBank')) || [];
  return [...defaultQuestionBank, ...customQuestions];
}

function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let timerInterval;
let timeLeft = 50 * 60; // Chuẩn 50 phút
let currentQuestions = [];
let currentSubject = 'history';
// [BỔ SUNG MỚI] Mảng quản lý danh sách câu hỏi được đánh dấu phân vân (Flag)
let flaggedQuestions = {};

document.addEventListener("DOMContentLoaded", function () {
  const btnStartExam = document.getElementById("btnStartExam");
  if (btnStartExam) {
    btnStartExam.addEventListener("click", startExamProcess);
  }
});

function startExamProcess() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("examContentWrapper").style.display = "block";

  const urlParams = new URLSearchParams(window.location.search);
  currentSubject = urlParams.get('subject') || 'history';

  const subjectTitle = document.getElementById('subjectTitle');
  if (subjectTitle) {
    subjectTitle.textContent = currentSubject === 'history' ? 'MÔN LỊCH SỬ (40 CÂU)' : 'MÔN ĐỊA LÝ (40 CÂU)';
  }

  const allBank = getFullQuestionBank();
  const filteredBySubject = allBank.filter(q => q.subject === currentSubject);

  const shuffled = shuffleArray(filteredBySubject);
  currentQuestions = shuffled.slice(0, 40); // Chuẩn 40 câu

  const container = document.getElementById('questionsContainer');
  const paletteContainer = document.getElementById('questionPalette');
  if (!container) return;

  container.innerHTML = '';
  if (paletteContainer) paletteContainer.innerHTML = '';

  if (currentQuestions.length === 0) {
    container.innerHTML = '<p class="card">Chưa có câu hỏi nào cho môn này. Vui lòng vào trang Quản lý câu hỏi để thêm.</p>';
    return;
  }

  currentQuestions.forEach((q, index) => {
    // 1. Render Câu hỏi
    const qCard = document.createElement('div');
    qCard.className = 'card question-card';
    qCard.id = `question_card_${index}`;

    let optionsHTML = '';
    q.answers.forEach((opt, optIndex) => {
      optionsHTML += `
        <label class="option-item">
          <input type="radio" name="question_${index}" value="${optIndex}" required>
          <span><strong>${String.fromCharCode(65 + optIndex)}.</strong> ${opt}</span>
        </label>
      `;
    });

    // [BỔ SUNG MỚI] Hỗ trợ hiển thị ảnh minh họa nếu có
    let imageHtml = q.image ? `<div style="margin: 10px 0;"><img src="${q.image}" alt="Hình ảnh câu hỏi" style="max-width: 100%; border-radius: 6px; border: 1px solid #ddd;"></div>` : '';

    qCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="question-title">Câu ${index + 1}: ${q.question}</div>
        <!-- [BỔ SUNG MỚI] Nút bấm Đánh dấu phân vân (Flag / Bookmark) -->
        <button type="button" class="btn-flag" id="btn_flag_${index}" onclick="toggleFlagQuestion(${index})" style="background:#fff; border:1px solid #ffc107; color:#d39e00; padding:4px 10px; border-radius:15px; cursor:pointer; font-weight:bold; font-size:0.85rem;">
          🚩 Đánh dấu
        </button>
      </div>
      ${imageHtml}
      <div class="options-list" style="margin-top: 10px;">${optionsHTML}</div>
    `;
    container.appendChild(qCard);

    // 2. Render Nút Palette tương ứng
    if (paletteContainer) {
      const pBtn = document.createElement('button');
      pBtn.type = 'button';
      pBtn.className = 'palette-btn';
      pBtn.id = `palette_btn_${index}`;
      pBtn.textContent = index + 1;
      pBtn.onclick = function() {
        document.getElementById(`question_card_${index}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      paletteContainer.appendChild(pBtn);
    }
  });

  // [BỔ SUNG MỚI] Lắng nghe sự kiện chọn đáp án để cập nhật trạng thái Palette (Xanh lá)
  const quizForm = document.getElementById('quizForm');
  if (quizForm) {
    quizForm.addEventListener('change', function(e) {
      if (e.target.name && e.target.name.startsWith("question_")) {
        const qIdx = e.target.name.split("_")[1];
        updatePaletteStatus(qIdx);
      }
    });

    quizForm.onsubmit = function(e) {
      e.preventDefault();
      confirmAndSubmitQuiz();
    };
  }

  startTimer();
}

// [BỔ SUNG MỚI] Hàm xử lý bật/tắt đánh dấu phân vân (Flag)
window.toggleFlagQuestion = function(index) {
  flaggedQuestions[index] = !flaggedQuestions[index];
  const flagBtn = document.getElementById(`btn_flag_${index}`);
  
  if (flaggedQuestions[index]) {
    flagBtn.style.background = "#ffc107";
    flagBtn.style.color = "#000";
    flagBtn.innerHTML = "🚩 Đã đánh dấu";
  } else {
    flagBtn.style.background = "#fff";
    flagBtn.style.color = "#d39e00";
    flagBtn.innerHTML = "🚩 Đánh dấu";
  }
  updatePaletteStatus(index);
};

// [BỔ SUNG MỚI] Hàm cập nhật màu sắc Question Palette (Xanh: đã làm, Vàng: phân vân, Xám: chưa làm)
function updatePaletteStatus(qIdx) {
  const pBtn = document.getElementById(`palette_btn_${qIdx}`);
  if (!pBtn) return;

  const isChecked = !!document.querySelector(`input[name="question_${qIdx}"]:checked`);
  const isFlagged = !!flaggedQuestions[qIdx];

  pBtn.classList.remove("answered", "flagged");

  if (isFlagged) {
    pBtn.classList.add("flagged");
  } else if (isChecked) {
    pBtn.classList.add("answered");
  }
}

function startTimer() {
  const timerDisplay = document.getElementById('timeDisplay');
  timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert('Hết giờ làm bài! Hệ thống tự động nộp bài.');
      submitQuizAction();
    }
  }, 1000);
}

function confirmAndSubmitQuiz() {
  let unansweredCount = 0;
  currentQuestions.forEach((_, idx) => {
    const checked = document.querySelector(`input[name="question_${idx}"]:checked`);
    if (!checked) unansweredCount++;
  });

  let message = "Bạn có chắc chắn muốn nộp bài thi không?";
  if (unansweredCount > 0) {
    message = `⚠️ Bạn còn ${unansweredCount} câu chưa trả lời.\nBạn vẫn muốn nộp bài chứ?`;
  }

  if (confirm(message)) {
    submitQuizAction();
  }
}

function submitQuizAction() {
  clearInterval(timerInterval);

  let correctCount = 0;
  const userAnswersDetails = [];

  currentQuestions.forEach((q, index) => {
    const selectedOption = document.querySelector(`input[name="question_${index}"]:checked`);
    const userChoice = selectedOption ? parseInt(selectedOption.value) : -1;
    
    // [BỔ SUNG MỚI] Giải mã đáp án đúng để đối chiếu chấm điểm
    const correctAns = typeof q.correct === 'number' ? q.correct : decodeCorrectAnswer(q.correct);
    const isCorrect = userChoice === correctAns;

    if (isCorrect) correctCount++;

    userAnswersDetails.push({
      question: q.question,
      answers: q.answers,
      correct: correctAns,
      userChoice: userChoice,
      isCorrect: isCorrect,
      explanation: q.explanation || "Chưa có lời giải chi tiết cho câu hỏi này." // [BỔ SUNG MỚI]
    });
  });

  const total = currentQuestions.length;
  const score = total > 0 ? ((correctCount / total) * 10).toFixed(1) : 0;
  const timeUsedSeconds = (50 * 60) - timeLeft;
  const minutesUsed = Math.floor(timeUsedSeconds / 60);
  const secondsUsed = timeUsedSeconds % 60;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const candidateName = currentUser ? currentUser.fullname : 'Thí sinh Tự do';

  const quizResult = {
    candidateName: candidateName,
    subjectName: currentSubject === 'history' ? 'Lịch Sử' : 'Địa Lý',
    date: new Date().toLocaleString('vi-VN'),
    totalQuestions: total,
    correctCount: correctCount,
    score: score,
    timeSpent: `${minutesUsed} phút ${secondsUsed} giây`,
    details: userAnswersDetails
  };

  localStorage.setItem('latestQuizResult', JSON.stringify(quizResult));

  const history = JSON.parse(localStorage.getItem('examHistory')) || [];
  history.unshift(quizResult);
  localStorage.setItem('examHistory', JSON.stringify(history));

  window.location.href = 'result.html';
}