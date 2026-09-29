# Logic Exercises

QA work often starts before there is a perfect checklist. You receive partial information, notice constraints, test assumptions, and explain why a conclusion is safe enough to act on. Classic logic puzzles are useful because they make the reasoning visible.

Use an AI tutor as a thinking partner: ask for progressively smaller hints, request a critique of your reasoning, and check whether you proved the result or only guessed it. Keep your own attempt first.

## How to work with a puzzle

1. Restate the goal in one sentence.
2. List the known facts and constraints.
3. Name any uncertainty or missing condition.
4. Try a first path and write why it works or fails.
5. Ask the tutor for a hint only at the smallest useful level.
6. Finish with a short explanation that another tester could follow.

Useful tutor prompt:

> Review my reasoning for hidden assumptions and gaps. Give hints in small steps. Do not solve the whole puzzle unless I ask after my own attempt.

## Puzzle 1: Coins and scales

You have 8 coins. One coin is counterfeit and is lighter than the rest. You have a balance scale with no weights. How can you find the counterfeit coin in no more than three weighings?

Focus on how each weighing reduces the search space. After your attempt, ask the tutor whether every possible scale result is covered.

## Puzzle 2: Drivers and car colors

Three drivers — Alexey, Boris, and Viktor — drive cars of three different colors: red, blue, and green.

- Alexey does not drive the red car.
- Boris does not drive the green car.
- Viktor does not drive the blue car.

Who drives which car?

Before choosing one mapping, check whether the facts produce a unique answer. This is a QA habit: sometimes a requirement allows more than one valid behavior.

## Puzzle 3: Pouring water

You have two containers: one holds 3 liters and the other holds 5 liters. How can you measure exactly 4 liters of water?

Track state after each action: how much water is in each container, and why the action is allowed.

## Puzzle 4: Crossing the bridge

Four people must cross a bridge at night. They have one flashlight. The bridge can hold only two people at a time. Their crossing times are A — 1 minute, B — 2 minutes, C — 5 minutes, and D — 10 minutes. When two people cross together, they move at the speed of the slower person. How can all four cross in 17 minutes?

The trap is local optimization. A plan that looks fastest step by step may lose time later. Compare at least two strategies.

## Puzzle 5: Two doors

In front of you are two doors: behind one is the exit, behind the other is a trap. Two guards stand by the doors. One guard always tells the truth; the other always lies. You may ask one question to one guard to find the exit. What question will you ask?

Explain why the question works for both possible guards. A strong answer covers both branches.

## QA transfer

When you test software, apply the same habits:

- separate facts from assumptions;
- check whether the data is enough for one conclusion;
- cover branches, not only the happy path;
- record intermediate states when behavior changes over time;
- ask AI for critique, not just a final answer.
