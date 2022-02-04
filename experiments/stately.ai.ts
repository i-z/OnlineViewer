import { createMachine } from "xstate";

let showBriefings = false;

const gameplayStateMachine = createMachine({
  id: "gameplayStateMachine",
  initial: "intro",
  states: {
    intro: {
      entry: (context, event) => prepareQuestion(),
      on: {
        "": [
          { target: "briefing", cond: (context, event) => showBriefings },
          { target: "thinking", cond: (context, event) => !showBriefings },
        ],
      },
    },
    briefing: {
      entry: (context, event) => showBriefing(),
      on: { "[BriefingWindowEventType.OK]": "thinking" },
    },
    thinking: {
      entry: (context, event) => beginThinking(),
      on: {
        MAKE_A_CHOICE: "choice_confirmation",
        TAKE_A_BOOSTER: "booster_applying",
        "[GameScreenEventType.TIMES_UP]": "review",
      },
    },
    choice_confirmation: {
      entry: (context, event) => askForConfirmation(),
      exit: (context, event) => hideConfirmation(),
      on: {
        "[GameScreenEventType.YES]": "intrigue",
        "[GameScreenEventType.NO]": {
          target: "thinking",
          actions: (context, event) => cancelChoice(),
        },
        "[GameScreenEventType.TIMES_UP]": {
          target: "review",
          actions: (context, event) => cancelChoice(),
        },
      },
    },
    intrigue: {
      entry: (context, event) => beginIntrigue(),
      on: { RIGHT_CHOICE: "congratulations", WRONG_CHOICE: "review" },
    },
    congratulations: {
      entry: (context, event) => congratulate(),
      on: { NEXT_QUESTION: "intro", QUESTIONS_ENDED: "happy_end" },
    },
    review: {
      entry: (context, event) => reviewAnswer(),
      on: {
        NEXT_QUESTION: "intro",
        NO_ATTEMPTS: "farewell",
        QUESTIONS_ENDED: "happy_end",
      },
    },
    farewell: {
      type: "final",
      entry: (context, event) => farewell(),
    },
    booster_applying: {
      entry: (context, event) => applyBooster(),
      exit: (context, event) => hideBoosters(),
      on: {
        " [BoostersComponentEventType.BOOSTER_APPLIED]": "thinking",
        MAKE_A_CHOICE: "thinking",
        "[BriefingWindowEventType.OK]": "thinking",
        "[GameScreenEventType.TIMES_UP]": "review",
      },
    },
    happy_end: {
      entry: (context, event) => happyEnd(),
      type: "final",
    },
  },
});

function prepareQuestion() {}
function showBriefing() {}
function beginThinking() {}
function askForConfirmation() {}
function hideConfirmation() {}
function cancelChoice() {}
function beginIntrigue() {}
function congratulate() {}
function reviewAnswer() {}
function farewell() {}
function applyBooster() {}
function hideBoosters() {}
function happyEnd() {}

let tutorShown = false;

const screensStateMachine = createMachine({
  id: "screensStateMachine",
  initial: "welcome",
  states: {
    welcome: {
      invoke: {
        id: "screenChange",
        src: (context, event) => welcome(),
      },
      on: {
        "[WelcomeScreenEventType.PLAY]": [
          {
            target: "gameplay",
            cond: (context, event) => tutorShown,
          },
          {
            target: "tutorial",
            cond: (context, event) => tutorShown,
          },
        ],
        "[RetryButtonEventType.EXIT]": "exit",
      },
    },
    tutorial: {
      invoke: {
        id: "screenChange",
        src: (context, event) => showTutorial(),
      },
      on: {
        "[TutorialScreenEventType.DONE]": "gameplay",
      },
    },
    gameplay: {
      on: {
        "[QuizEventType.WON]": "win",
        "[QuizEventType.FAILED]": "lose",
        "[RetryButtonEventType.EXIT]": {
          target: "exit",
          actions: (context, event) => pauseGame(),
        },
      },
      invoke: {
        id: "screenChange",
        src: (context, event) => startQuiz(),
      },
    },
    win: {
      invoke: {
        id: "screenChange",
        src: (context, event) => wonQuiz(),
      },
      on: {
        "[RetryButtonEventType.RETRY]": "retry",
        "[RetryButtonEventType.EXIT]": "exit",
      },
    },
    lose: {
      invoke: {
        id: "screenChange",
        src: (context, event) => failedQuiz(),
      },
      on: {
        "[RetryButtonEventType.RETRY]": "gameplay",
      },
    },
    retry: {
      invoke: {
        id: "screenChange",
        src: (context, event) => toRetry(),
      },
      on: { "[RetryButtonEventType.RETRY]": "gameplay" },
    },
    exit: {
      on: {
        "[GameScreenEventType.NO]": [
          {
            target: "win",
            cond: (context, event) => Math.random() > 0.5,
          },
          {
            target: "gameplay",
            cond: (context, event) => Math.random() > 0.5,
          },
          {
            target: "welcome",
            cond: (context, event) => Math.random() > 0.5,
          },
        ],
        "[GameScreenEventType.YES]": "finalExit",
      },
      invoke: {
        id: "screenChange",
        src: (context, event) => toExit(),
      },
    },
    finalExit: {
      type: "final",
      entry: (context, event) => {
        window.close();
      },
    },
  },
});

function welcome() {}
function showTutorial() {}
function pauseGame() {}
function startQuiz() {}
function wonQuiz() {}
function failedQuiz() {}
function toRetry() {}
function toExit() {}
