// Import Puter AI script
const script = document.createElement('script');
script.src = 'https://js.puter.com/v2/';
document.head.appendChild(script);

import { gsap } from 'gsap';

let questionCount = 0;
let questions = [];
let score = 0;
const MAX_QUESTIONS = 10;

const prompt = "Create 10 funny and cute relationship scenario questions of length about 2-3 lines with each scenario either showing a red flag or green flag. The user shall be able to read the scenario and think if that's a red flag or green flag. Don't give any extra information, just append 0 to the scenario if it's a red flag and 1 if it's a green flag.";

// Wait for Puter script to load
script.onload = () => {
  init();
  createFloatingElements();
};

function createFloatingElements() {
  const hearts = document.querySelector('.floating-hearts');
  const flags = document.querySelector('.floating-flags');
  
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.position = 'absolute';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top = `${Math.random() * 100}%`;
    heart.style.animation = `float ${3 + Math.random() * 2}s ease-in-out infinite`;
    heart.style.animationDelay = `${Math.random() * 2}s`;
    hearts.appendChild(heart);

    const flag = document.createElement('div');
    flag.innerHTML = Math.random() > 0.5 ? '🚩' : '💚';
    flag.style.position = 'absolute';
    flag.style.left = `${Math.random() * 100}%`;
    flag.style.top = `${Math.random() * 100}%`;
    flag.style.animation = `float ${3 + Math.random() * 2}s ease-in-out infinite`;
    flag.style.animationDelay = `${Math.random() * 2}s`;
    flags.appendChild(flag);
  }
}

async function getQuestions() {
  const resp = await puter.ai.chat(prompt);
  let response = String(resp);
  
  response = response.replaceAll("*", "").replaceAll("#", "").replaceAll("\n", "");
  let questionArray = [];
  
  for(let i = 1; i < MAX_QUESTIONS; i++) {
    let question = response.split(i.toString()+".")[1].split((i+1).toString()+".")[0];
    const flag = question.includes('0')?0:1;
    question = question.replaceAll(flag.toString(),"");
    question = question.replaceAll(i+".", "");
    questionArray.push({
      text: question,
      isGreenFlag: flag === '1'
    });
  }
  
  let lastQuestion = response.split(MAX_QUESTIONS+".")[1];
  const lastFlag = lastQuestion.includes('0')?0:1;
  lastQuestion = lastQuestion.replaceAll(lastFlag.toString(),"");
  lastQuestion = lastQuestion.replaceAll(MAX_QUESTIONS+".", "");
  questionArray.push({
    text: lastQuestion,
    isGreenFlag: lastFlag === '1'
  });

  return questionArray;
}

function updateProgress() {
  const progress = (questionCount / MAX_QUESTIONS) * 100;
  gsap.to('.progress', {
    width: `${progress}%`,
    duration: 0.5,
    ease: 'power2.out'
  });
}

function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
    gsap.set(screen, { opacity: 0 });
  });

  const targetScreen = document.getElementById(screenId);
  targetScreen.classList.add('active');
  gsap.to(targetScreen, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out'
  });
}

function displayQuestion() {
  const currentQuestion = questions[questionCount];
  document.getElementById('questionText').textContent = currentQuestion.text;
  updateProgress();
}

function showResult(isCorrect) {
  const resultMessage = document.getElementById('resultMessage');
  const resultEmoji = document.querySelector('.result-emoji');
  
  if (isCorrect) {
    score++;
    resultMessage.textContent = "You've got great instincts! 🌟";
    resultEmoji.textContent = "✨";
  } else {
    resultMessage.textContent = "Oops! That's not quite right. Let's learn from this! 📚";
    resultEmoji.textContent = "💭";
  }
  
  showScreen('result');
}

function showEndScreen() {
  const finalScore = document.getElementById('finalScore');
  const endMessage = document.getElementById('endMessage');
  
  finalScore.textContent = score;
  
  let message;
  const percentage = (score / MAX_QUESTIONS) * 100;
  
  if (percentage >= 90) {
    message = "Amazing! You're a relationship expert! 🏆";
  } else if (percentage >= 70) {
    message = "Great job! You have good relationship instincts! 🌟";
  } else if (percentage >= 50) {
    message = "Not bad! Keep learning and trust your gut! 💪";
  } else {
    message = "Time to brush up on those relationship signs! 📚";
  }
  
  endMessage.textContent = message;
  showScreen('end');
  
  // Animate the score reveal
  gsap.from('#finalScore', {
    textContent: 0,
    duration: 2,
    ease: 'power2.out',
    snap: { textContent: 1 },
    stagger: {
      each: 0.15,
      onUpdate: function() {
        this.targets()[0].innerHTML = Math.ceil(this.targets()[0].textContent);
      },
    }
  });
}

function init() {
  document.getElementById('startBtn').addEventListener('click', async () => {
    questionCount = 0;
    score = 0;
    showScreen('loading');
    
    try {
      questions = await getQuestions();
      displayQuestion();
      showScreen('question');
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  });

  document.querySelectorAll('.option').forEach(button => {
    button.addEventListener('click', () => {
      const userChoice = button.dataset.value === 'green';
      const currentQuestion = questions[questionCount];
      const isCorrect = userChoice === currentQuestion.isGreenFlag;
      showResult(isCorrect);
    });
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    questionCount++;
    if (questionCount < MAX_QUESTIONS) {
      displayQuestion();
      showScreen('question');
    } else {
      showEndScreen();
    }
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    questionCount = 0;
    score = 0;
    showScreen('welcome');
  });

  // Initial animations
  gsap.from('.character', {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: 'bounce.out'
  });

  gsap.from('.quiz-container', {
    y: 50,
    opacity: 0,
    duration: 1,
    delay: 0.5,
    ease: 'power3.out',
    rotationX: -15
  });
}
