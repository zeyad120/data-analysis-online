document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  // Get name function
  const getName = () => {
    return localStorage.getItem('userName') || 'Student';
  };

  if (page === 'home') {
    const heroCard = document.getElementById('hero-card');
    if (heroCard) {
      heroCard.addEventListener('click', () => {
        window.location.href = 'chapters.html';
      });
    }
  }

  if (page === 'chapters') {
    const banner = document.getElementById('name-banner');
    if (banner) {
      const name = getName();
      banner.textContent = name ? `Hello, ${name}!` : 'Hello, curious learner!';
    }
  }

  const quizSection = document.querySelector('.quiz-questions');
  if (!quizSection) {
    return;
  }

  const questions = Array.from(document.querySelectorAll('.question'));
  const submitBtn = document.getElementById('submit-quiz');
  
  // Create grade output element if it doesn't exist
  let gradeOutput = document.getElementById('grade-output');
  if (!gradeOutput && submitBtn) {
    gradeOutput = document.createElement('div');
    gradeOutput.id = 'grade-output';
    submitBtn.parentNode.insertBefore(gradeOutput, submitBtn.nextSibling);
  }

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
    question.dataset.correct = isCorrect.toString();

    if (isCorrect) {
      question.classList.add('question--correct');
      question.classList.remove('question--incorrect');
      if (explanation) explanation.classList.add('visible');
    } else {
      question.classList.remove('question--correct');
      question.classList.add('question--incorrect');
      if (explanation) explanation.classList.remove('visible');
    }

    return true;
  };

  // Add event listeners to check answer buttons
  questions.forEach((question) => {
    const checkBtn = question.querySelector('.check-answer');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => evaluateQuestion(question));
    }
  });

  // Add submit button functionality
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Evaluate all questions
      let allAnswered = true;
      questions.forEach((question) => {
        const selected = question.querySelector('input[type="radio"]:checked');
        if (!selected) {
          allAnswered = false;
          const errorField = question.querySelector('.question-error') || 
                           document.createElement('div');
          errorField.className = 'question-error';
          errorField.textContent = 'Please select an answer.';
          question.appendChild(errorField);
        } else if (e.target === submitBtn) {
          // Only evaluate if it's the final submission
          evaluateQuestion(question);
        }
      });

      if (!allAnswered) {
        if (confirm('Some questions are unanswered. Submit anyway?')) {
          calculateAndDisplayScore();
        }
        return;
      }

      calculateAndDisplayScore();
    });
  }

  function calculateAndDisplayScore() {
    const correctCount = questions.filter(q => q.dataset.correct === 'true').length;
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    
    if (gradeOutput) {
      gradeOutput.textContent = `You scored ${correctCount} out of ${total} (${percentage}%).`;
      gradeOutput.style.display = 'block';
      gradeOutput.scrollIntoView({ behavior: 'smooth' });
    }

    // Optional: Store the score
    try {
      const scoreData = {
        score: correctCount,
        total: total,
        percentage: percentage,
        date: new Date().toISOString()
      };
      localStorage.setItem('lastQuizScore', JSON.stringify(scoreData));
    } catch (e) {
      console.error('Could not save score to localStorage', e);
    }
  }
});