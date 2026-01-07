const storageKey = 'participantName';

const saveName = (value) => {
  localStorage.setItem(storageKey, value);
};

const getName = () => localStorage.getItem(storageKey) || '';

const goToChapters = () => {
  window.location.href = 'chapters.html';
};

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'home') {
    const nameInput = document.getElementById('name-input');
    const startBtn = document.getElementById('start-btn');
    const heroCard = document.getElementById('hero-card');
    const error = document.getElementById('name-error');

    const validateName = () => {
      const value = nameInput.value.trim();
      startBtn.disabled = value === '';
      if (value) {
        error.textContent = '';
      }
      return value;
    };

    nameInput.value = getName();
    validateName();

    const attemptProceed = () => {
      const value = validateName();
      if (!value) {
        error.textContent = 'Please enter your name before continuing.';
        return;
      }
      saveName(value);
      goToChapters();
    };

    startBtn.addEventListener('click', attemptProceed);
    heroCard.addEventListener('click', attemptProceed);
    nameInput.addEventListener('input', validateName);
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

  questions.forEach((question) => {
    const checkBtn = question.querySelector('.check-answer');
    checkBtn.addEventListener('click', () => evaluateQuestion(question));
  });

  submitBtn.addEventListener('click', () => {
    questions.forEach((question) => {
      evaluateQuestion(question);
    });

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
        body: JSON.stringify({ name, date })
      });
    }
  });
});
