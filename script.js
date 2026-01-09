// Function to save quiz state to localStorage
function saveQuizState(questionId, answer) {
  const quizState = JSON.parse(localStorage.getItem('quizState') || '{}');
  quizState[questionId] = answer;
  localStorage.setItem('quizState', JSON.stringify(quizState));
}

// Function to load quiz state from localStorage
function loadQuizState() {
  return JSON.parse(localStorage.getItem('quizState') || '{}');
}

// Function to clear quiz state
function clearQuizState() {
  localStorage.removeItem('quizState');
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'home') {
    const heroCard = document.getElementById('hero-card');
    
    heroCard.addEventListener('click', () => {
      window.location.href = 'chapters.html';
    });
  }

  if (page === 'chapters') {
    const banner = document.getElementById('name-banner');
    const name = getName();
    banner.textContent = name ? `Hello, ${name}!` : 'Hello, curious learner!';
  }

  const quizSection = document.querySelector('.quiz-questions');
  if (!quizSection) {
    return;
  }
  
  // Load saved quiz state
  const savedState = loadQuizState();
  Object.entries(savedState).forEach(([questionId, answerId]) => {
    const input = document.querySelector(`#${questionId}_${answerId}`);
    if (input) {
      input.checked = true;
      // Evaluate the question to show correct/incorrect state
      const question = input.closest('.question');
      if (question) {
        evaluateQuestion(question);
      }
    }
  });

  const questions = Array.from(document.querySelectorAll('.question'));
  const gradeOutput = document.getElementById('grade-output');
  const submitBtn = document.getElementById('submit-quiz');

  const evaluateQuestion = (question) => {
    const explanation = question.querySelector('.explanation');
    const errorField = question.querySelector('.question-error');
    const selected = question.querySelector('input[type="radio"]:checked');

    if (!selected) {
      if (errorField) {
        errorField.textContent = 'Select an answer before checking.';
      }
      return false;
    }

    if (errorField) {
      errorField.textContent = '';
    }

    const isCorrect = selected.value === question.dataset.answer;
    question.dataset.answerChecked = 'true';
    question.dataset.correct = isCorrect ? 'true' : 'false';

    if (isCorrect) {
      question.classList.add('question--correct');
      question.classList.remove('question--incorrect');
      explanation.classList.add('visible');
    } else {
      question.classList.remove('question--correct');
      question.classList.add('question--incorrect');
      explanation.classList.remove('visible');
    }

    return true;
  };

  // Add event listeners to radio buttons to save state when changed
  questions.forEach((question) => {
    const checkBtn = question.querySelector('.check-answer');
    checkBtn.addEventListener('click', () => evaluateQuestion(question));
    
    // Save state when an answer is selected
    const radioInputs = question.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
      input.addEventListener('change', () => {
        saveQuizState(question.id, input.value);
      });
    });
  });

  submitBtn.addEventListener('click', () => {
    let allAnswered = true;
    questions.forEach((question) => {
      if (!evaluateQuestion(question)) {
        allAnswered = false;
      }
    });

    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    const correctCount = questions.filter((q) => q.dataset.correct === 'true').length;
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    gradeOutput.textContent = `You scored ${correctCount}/${total} (${percentage}%).`;

    // Admin logging: send name and date to backend
    const name = getName();
    if (name) {
      const date = new Date().toLocaleString();
      fetch('http://localhost:3001/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, score: `${correctCount}/${total}` })
      });
    }
    
    // Clear the saved state after successful submission
    clearQuizState();
  });
});
