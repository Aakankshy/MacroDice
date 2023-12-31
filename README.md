﻿
# Macro Dice
This is a simple web app utility aimed at making TTRPGs like Dungeons & Dragons more accessible. With its sleek and functionally adaptive UI, users can effortlessly simulate dice rolls for their characters. Users can easily navigate throughout the app with just a keyboard but also have the option of clicking the on-screen buttons for speed and convenience.

Originally, this was a utility that I quickly put together some time ago for my long-time utility bot on Discord (the chat service) to roll dice for my games. But, being a private bot that I haven't properly updated for a long time, I figured it was time I took the core of the back-end and house it behind a more refined and finished UI.

### Features
Using an intuitive (and relatively standardized) naming convention, the user can define what dice they would like to roll into the text box at the bottom of the screen. Alternatively, they can use the macro buttons on the right side of the screen for efficiency. Some example macros follow:

- `1d4` -- rolls one 4-sided die

- `2d6` -- rolls two 6-sided dice and reports the sum of their results

- `1d20+5` -- rolls one 20-sided die and adds 5 to the result of the roll

- `1d12-3` -- rolls one 12-sided die and subtracts 3 from the result of the roll

- `1d365` -- rolls one 365-sided die... in a manner of speaking...

- `2(1d6)` -- rolls two 6-sided dice and reports their results separately (for rolling with advantage or disadvantage)

- `2(1d20+3)` -- rolls two 20-sided dice, adds 3 to both of their results and reports both totals separately (what a mouthful!)

- `1d20+7 2d6+5` -- to combine many macros into one line; each one evaluates separately (e.g. for rolling attacks and damage together)

There are buttons on the screen for submitting what the user has typed up (which is what parses the input and rolls the corresponding dice) and also clearing the macro/roll history. When the latter is clicked, there is a confirmation dialogue that shows up to ask if they really would like to clear the macro history.

Alternatively, the user can press the `Enter` or `Return` key to submit the contents of the text box. If the text box is empty when the user presses this key, that same popup appears to ask if the user really wants to clear the macro history. Pressing `Enter` or `Return` again confirms the prompt and pressing `Esc` cancels it.
