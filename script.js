// =============================================================
// QUIZMASTER — script.js
// =============================================================
// STRUCTURE OF THIS FILE:
//   1. Question bank (the data)
//   2. State variables (the game's "memory")
//   3. DOM references (links to HTML elements)
//   4. Core functions  — startQuiz, loadQuestion, selectAnswer,
//                        nextQuestion, showResults, restartQuiz
//   5. Helper functions — updateProgress, updateLiveScore, etc.
//   6. Kick-off call — startQuiz() at the bottom
// =============================================================


// =============================================================
// 1. QUESTION BANK
// An array of objects. Each object = one question.
// Properties:
//   question  — the question text (string)
//   options   — 4 possible answers (array of strings)
//   answer    — index of the CORRECT option (0, 1, 2, or 3)
//   category  — shown as a small tag above the question
// =============================================================
const questions = [
  {
    question:  "What does HTML stand for?",
    options:   ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Logic", "Home Tool Markup Language"],
    answer:    0,
    category:  "Web Dev"
  },
  {
    question:  "Which CSS property controls the text size?",
    options:   ["text-size", "font-style", "font-size", "text-scale"],
    answer:    2,
    category:  "CSS"
  },
  {
    question:  "Which planet is known as the Red Planet?",
    options:   ["Venus", "Jupiter", "Mars", "Saturn"],
    answer:    2,
    category:  "Science"
  },
  {
    question:  "What keyword declares a variable in modern JavaScript?",
    options:   ["var", "let", "define", "both A and B"],
    answer:    3,
    category:  "JavaScript"
  },
  {
    question:  "In JavaScript, what does === check?",
    options:   ["Value only", "Type only", "Both value and type", "Neither"],
    answer:    2,
    category:  "JavaScript"
  },
  {
    question:  "What is the capital of Japan?",
    options:   ["Beijing", "Seoul", "Bangkok", "Tokyo"],
    answer:    3,
    category:  "Geography"
  },
  {
    question:  "Which HTML tag creates a hyperlink?",
    options:   ["<link>", "<a>", "<href>", "<url>"],
    answer:    1,
    category:  "Web Dev"
  },
  {
    question:  "What does CSS stand for?",
    options:   ["Colorful Style Sheets", "Cascading Style Sheets", "Computer Style System", "Creative Syntax Styling"],
    answer:    1,
    category:  "CSS"
  },
  {
    question:  "How many bits are in one byte?",
    options:   ["4", "16", "8", "32"],
    answer:    2,
    category:  "Computer Science"
  },
  {
    question:  "Which method adds an item to the END of a JavaScript array?",
    options:   ["push()", "pop()", "shift()", "append()"],
    answer:    0,
    category:  "JavaScript"
  }
];


// =============================================================
// 2. STATE VARIABLES
// These hold information that changes as the quiz runs.
// =============================================================
let currentIndex  = 0;    // which question we're on (0 = first)
let score         = 0;    // how many correct answers so far
let answered      = false; // has the user answered the current question?


// =============================================================
// 3. DOM REFERENCES
// We grab all the HTML elements we'll need to read or update.
// =============================================================
const quizScreen     = document.getElementById("quizScreen");
const resultsScreen  = document.getElementById("resultsScreen");
const questionText   = document.getElementById("questionText");
const optionsGrid    = document.getElementById("optionsGrid");
const feedbackBar    = document.getElementById("feedbackBar");
const feedbackIcon   = document.getElementById("feedbackIcon");
const feedbackText   = document.getElementById("feedbackText");
const nextBtn        = document.getElementById("nextBtn");
const currentQEl     = document.getElementById("currentQ");
const totalQEl       = document.getElementById("totalQ");
const progressFill   = document.getElementById("progressFill");
const liveScore      = document.getElementById("liveScore");
const categoryTag    = document.getElementById("categoryTag");

// Results screen elements
const resultBadge    = document.getElementById("resultBadge");
const resultHeading  = document.getElementById("resultHeading");
const resultSub      = document.getElementById("resultSub");
const scorePct       = document.getElementById("scorePct");
const ringFill       = document.getElementById("ringFill");
const correctCount   = document.getElementById("correctCount");
const wrongCount     = document.getElementById("wrongCount");
const totalCount     = document.getElementById("totalCount");


// =============================================================
// 4A. startQuiz()
// Initialises (or re-initialises) the quiz state.
// Called once on page load and again when restarting.
// =============================================================
function startQuiz() {
  // Reset state variables
  currentIndex = 0;
  score        = 0;
  answered     = false;

  // Set the total question count in the header
  totalQEl.textContent = questions.length;

  // Make sure quiz screen is visible and results are hidden
  quizScreen.classList.remove("hidden");
  resultsScreen.classList.add("hidden");

  // Reset live score display
  liveScore.textContent = "0";

  // Load the first question
  loadQuestion();
}


// =============================================================
// 4B. loadQuestion()
// Displays the current question and builds the answer buttons.
// =============================================================
function loadQuestion() {
  // Reset answered flag for this new question
  answered = false;

  // Hide feedback bar and Next button
  feedbackBar.classList.add("hidden");
  nextBtn.classList.add("hidden");
  feedbackBar.className = "feedback-bar hidden"; // clear colour classes too

  // Get the current question object from our array
  // currentIndex starts at 0 (first item), increases each turn
  const q = questions[currentIndex];

  // Update the question number counter (add 1 because arrays start at 0)
  currentQEl.textContent = currentIndex + 1;

  // Update the category tag
  categoryTag.textContent = q.category;

  // Update the question text
  // Force a re-animation by cloning the node (restarts the CSS animation)
  questionText.style.animation = "none";
  void questionText.offsetHeight; // trigger reflow
  questionText.style.animation   = "";
  questionText.textContent = q.question;

  // Update the progress bar width
  updateProgress();

  // Clear any old buttons from the previous question
  optionsGrid.innerHTML = "";

  // Build one button per option
  // q.options is an array like ["Paris", "London", "Berlin", "Madrid"]
  const letters = ["A", "B", "C", "D"];

  q.options.forEach(function(optionText, index) {
    // Create a <button> element in JavaScript
    const btn = document.createElement("button");

    btn.className         = "option-btn";
    btn.textContent       = optionText;
    btn.dataset.letter    = letters[index]; // used by CSS ::before for the badge
    btn.dataset.index     = index;          // store the option index for checking

    // When the button is clicked, call selectAnswer() with this index
    btn.addEventListener("click", function() {
      selectAnswer(index);
    });

    // Append the button to the options grid
    optionsGrid.appendChild(btn);
  });
}


// =============================================================
// 4C. selectAnswer(selectedIndex)
// Called when the user clicks an answer button.
// @param {number} selectedIndex — which option (0-3) was clicked
// =============================================================
function selectAnswer(selectedIndex) {
  // If the user already answered, do nothing (prevents double-clicking)
  if (answered) return;
  answered = true;

  // Get the correct answer index for this question
  const correctIndex = questions[currentIndex].answer;

  // Get all the option buttons as a list
  const buttons = optionsGrid.querySelectorAll(".option-btn");

  // Disable every button — no more clicking after answering
  buttons.forEach(function(btn) {
    btn.disabled = true;
  });

  // ---- Check if the user got it right ----
  if (selectedIndex === correctIndex) {
    // CORRECT ✓
    score++; // add 1 to the score
    updateLiveScore();

    // Add the green "correct" style to the clicked button
    buttons[selectedIndex].classList.add("correct");

    // Show positive feedback bar
    showFeedback(true, "Correct! Well done! 🎉");

  } else {
    // WRONG ✗
    // Add the red "wrong" style to the button the user clicked
    buttons[selectedIndex].classList.add("wrong");

    // Also highlight the ACTUAL correct answer in green
    // so the user can learn the right answer
    buttons[correctIndex].classList.add("correct");

    // Show the correct answer in the feedback text
    const correctText = questions[currentIndex].options[correctIndex];
    showFeedback(false, `Not quite. The answer was: "${correctText}"`);
  }

  // Show the Next button so the user can proceed
  nextBtn.classList.remove("hidden");

  // Change the button text on the last question
  if (currentIndex === questions.length - 1) {
    nextBtn.textContent = "See Results →";
  } else {
    nextBtn.textContent = "Next Question →";
  }
}


// =============================================================
// 4D. nextQuestion()
// Moves to the next question, or ends the quiz if we're done.
// Called when the user clicks the "Next Question" button.
// =============================================================
function nextQuestion() {
  currentIndex++; // move to the next question index

  // Check if we've gone past the last question
  if (currentIndex >= questions.length) {
    showResults(); // end of quiz!
  } else {
    loadQuestion(); // load the next question
  }
}


// =============================================================
// 4E. showResults()
// Hides the quiz and shows the final score screen.
// =============================================================
function showResults() {
  // Hide quiz, show results
  quizScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");

  const total   = questions.length;
  const wrong   = total - score;
  const pct     = Math.round((score / total) * 100); // percentage score

  // Fill in the numbers
  correctCount.textContent = score;
  wrongCount.textContent   = wrong;
  totalCount.textContent   = total;
  scorePct.textContent     = pct + "%";

  // Animate the SVG ring
  // The circle has a circumference of 2π × 50 ≈ 314px.
  // We set stroke-dashoffset to (1 - score%) × 314.
  // offset = 314 → empty ring;  offset = 0 → full ring.
  const circumference = 314;
  const offset = circumference - (pct / 100) * circumference;

  // Small delay so the CSS transition has time to run after the element appears
  setTimeout(function() {
    ringFill.style.strokeDashoffset = offset;
  }, 100);

  // Pick a badge emoji and message based on the score
  let badge, heading, sub;

  if (pct === 100) {
    badge   = "🏆";
    heading = "Perfect Score!";
    sub     = "You aced every question. Incredible!";
  } else if (pct >= 80) {
    badge   = "⭐";
    heading = "Excellent!";
    sub     = "You really know your stuff!";
  } else if (pct >= 60) {
    badge   = "👍";
    heading = "Good Job!";
    sub     = "Solid effort — keep practising!";
  } else if (pct >= 40) {
    badge   = "📚";
    heading = "Keep Learning!";
    sub     = "Review the topics and try again.";
  } else {
    badge   = "💪";
    heading = "Don't Give Up!";
    sub     = "Every expert was once a beginner.";
  }

  resultBadge.textContent   = badge;
  resultHeading.textContent = heading;
  resultSub.textContent     = sub;
}


// =============================================================
// 4F. restartQuiz()
// Resets everything and starts from question 1 again.
// =============================================================
function restartQuiz() {
  // Reset the SVG ring back to empty for next run
  ringFill.style.strokeDashoffset = 314;

  // Small delay to let the ring reset before re-running
  setTimeout(function() {
    startQuiz();
  }, 100);
}


// =============================================================
// 5. HELPER FUNCTIONS
// =============================================================

/**
 * updateProgress()
 * Sets the width of the progress bar as a percentage.
 * Formula: (questions answered so far / total) × 100
 */
function updateProgress() {
  const pct = (currentIndex / questions.length) * 100;
  progressFill.style.width = pct + "%";
}

/**
 * updateLiveScore()
 * Updates the score counter in the top-right pill.
 */
function updateLiveScore() {
  liveScore.textContent = score;
}

/**
 * showFeedback(isCorrect, message)
 * Shows the green or red feedback bar under the options.
 * @param {boolean} isCorrect — true = green, false = red
 * @param {string}  message   — text to display
 */
function showFeedback(isCorrect, message) {
  feedbackBar.classList.remove("hidden", "correct-fb", "wrong-fb");

  if (isCorrect) {
    feedbackIcon.textContent = "✓";
    feedbackBar.classList.add("correct-fb");
  } else {
    feedbackIcon.textContent = "✗";
    feedbackBar.classList.add("wrong-fb");
  }

  feedbackText.textContent = message;
}


// =============================================================
// 6. KEYBOARD SUPPORT
// Press Enter to advance to the next question (after answering)
// =============================================================
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && answered) {
    nextQuestion();
  }
});


// =============================================================
// 7. KICK OFF
// This single line starts everything when the page loads.
// =============================================================
startQuiz();
