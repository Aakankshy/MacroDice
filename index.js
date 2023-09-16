// OLD REGEX
// const godRegex = /(?:([1-9]\d*)\(){0,1}([1-9]\d*)d([1-9]\d*)(?:([+-])([1-9]\d*)){0,1}\){0,1}/g
const godRegex = /(?:([1-9]\d*)\(){0,1}([1-9]\d*)d([1-9]\d*)(?:(.{0,1}))([1-9]\d*){0,1}\){0,1}/g

// Initializations
const input = document.getElementById("input")
const history = document.getElementById("history")
const historyContainer = document.getElementById("history-container")
const alertPopup = document.getElementById("alert-popup")

// Boolean flag to track popup status
let isPopupSummoned = false

// Event listeners
input.addEventListener("keyup", (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    submitMacro()
  }
})

input.addEventListener("keyup", (e) => {
  if (e.key === 'Escape' || e.keyCode === 27) {
    // Convenience: press Esc while focused on input box to unsummon popup
    if (isPopupSummoned) {
      unsummonClearPopup()
    }
  }
})



// ~ FUNCTIONS ~

// Params: inputString (raw user input)
// Desc: validates text as macro;
//  - if valid, resolves and updates macro history with results
//  - if invalid, provides a helpful error message in macro history
//       then returns true iff parse was successful
function sendMacro(inputString) {
  history.textContent += `→ ${inputString}\n`

  if (inputString && validateMacro(inputString)) {
    history.textContent += `${resolveMacro(inputString)}\n`
    return true
  } else {
    history.textContent += `${detectMacroError(inputString)}\n`
    return false
  }
}



// Desc: responds to user's intent to roll dice based on input
function submitMacro() {
  const currentInput = input.value.trim()
    
  // If input box is not empty
  if (currentInput) {
    // Try sending macro; clear text field iff macro was valid
    if(sendMacro(currentInput)) {
      input.value = ""
    }

    // Set container scroll bar to the bottom by default
    historyContainer.scrollTop = historyContainer.scrollHeight - historyContainer.clientHeight
  } else {
    // Convenience: press Enter when input box is blank to clear history
    if (!isPopupSummoned) {
      // If popup is not there, summon it
      summonClearPopup()
    } else {
      // Otherwise, shortcut to clear macros
      clearHistory()
      unsummonClearPopup()
    }
  }
}



// Desc: makes the history clear alert popup visible
function summonClearPopup() {
  alertPopup.className = "alert-wrapper-open"
  isPopupSummoned = true

  // Redundancy: keep focus on input box for Esc/Enter event listeners to work
  input.focus()
}



// Desc: makes the history clear alert popup invisible
function unsummonClearPopup() {
  alertPopup.className = "alert-wrapper"
  isPopupSummoned = false

  // Redundancy: keep focus on input box for Esc/Enter event listeners to work
  input.focus()
}



// Desc: clears all text from macro history
function clearHistory() {
  history.textContent = ""
  input.value = ""
}



// Params: macroString (valid macro 'stored in a button')
// Desc: automatically adds macroString to current macro
function autoMacro(macroString) {
  // If input box is currently non-blank
  if (input.value.trim()) {
    // Check if there is already a space at the end of the current input
    if (!input.value.endsWith(" ")) {
      // Otherwise append an extra space before pasting next macro arg
      input.value += " "
    }
  }

  // Append the macroString and an extra space after it
  input.value += `${macroString} `

  // Return focus to text box
  input.focus()
}



// Params: macroString (potentially a valid macro)
// Desc: returns true iff text can be parsed as a macro
function validateMacro(macroString) {
  let args = macroString.split(" ")

  for (var die of args) {
    // Try to apply diceroll regex to each text argument
    let array = [...die.matchAll(godRegex)]

    // False if regex does not apply (2 tests)
    if (!array) {
      return false
    }

    if(!array[0]) {
      return false
    }

    // False if sign is non-blank and not + or - or ) <- last one is the X(XdX) case
    // False if sign is valid but final character is invalid
    if (array[0][4]) {
      if (array[0][4] !== "+" && array[0][4] !== "-" && array[0][4] !== ")") {
        return false
      } else if (array[0][4] === ")") {
        // If it's a ), there must be no modifier
        if (array[0][5]) {
          return false
        }
      } else if (!array[0][5]) {
        return false
      }
    }
  }

  // Return true if no parsing errors
  return true
}



// Params: macroString (invalid macro)
// Desc: returns string listing each invalid arg in given macro
function detectMacroError(macroString) {
  let output = ""
  let args = macroString.split(" ")

  // Try resolving each argument; list every invalid arg
  for (var die of args) {
    if (!rollDie(die)) {
      output += `${die}: This roll was formatted incorrectly!\n`
    }
  }

  return output
}



// Params: macroString (must be a validated macro)
// Desc: parses macro; returns results as a formatted string
// NOTE: wants validated macro but defensively programmed regardless
function resolveMacro(macroString) {
  let output = ""
  let args = macroString.split(" ")
  
  for (var die of args) {
    let dieRoll = rollDie(die)

    if (dieRoll) {
      output += `${die}: ${dieRoll}\n`
    } else {
      // The code should ideally never hit this case
      output += `${die}: This roll was formatted incorrectly!\n`
    }
  }

  return output
}



// Params: die (single arg from a macro)
// Desc: determines the results of a single macro arg
function rollDie(die) {
  // regex lookup
  let array = [...die.matchAll(godRegex)]

  if (array) {
    // array[0][0] --> whole thing
    // array[0][1] --> X(1d20+...) <-- "repeatFactor"
    // array[0][2] --> Xd20+... <-- dice count
    // array[0][3] --> 1dX+... <-- die type
    // array[0][4] --> 1d20X... <-- modifier sign
    // array[0][5] --> 1d20+X <-- "modifier"

    // Sanity check for validity
    if(!array[0]) {
      return null
    }

    // Intitialize:
    // - result: value to output
    // - hasProperMod === false: indicates no bonus to be added
    let result = ""
    let repeatFactor = 1
    let modifier = 0
    let hasProperMod = true

    // Pull optional elements from parse
    // repeatFactor
    if (array[0][1]) {
      repeatFactor = +array[0][1]
    }

    // modifier
    if (array[0][5]) {
      modifier = +array[0][5]
    }
    
    // Format: (xx + xx + ...) + mod = total; ...
    // repeat separately a # of times equal to repeatFactor
    for (var i = 0; i < repeatFactor; i++) {
      // Resolve each repetition's total separately
      let total = 0

      // Apply modifier block...
      // - array[0][4] checks the sign value
      // - array[0][5] is the modifier bonus
      if (array[0][4]) {
        // There is a sign
        if (array[0][4] === "+") {
          // Add the modifier only if valid
          if (array[0][5]) {
            total = 0 + modifier
          } else {
            return null
          }
        } else if (array[0][4] === "-") {
          // Subtract the modifier only if valid
          if (array[0][5]) {
            total = 0 - modifier
          } else {
            return null
          }
        } else if (array[0][4] === ")") {
          // Potentially an unmodified macro with a high repeat factor
          // Confirm... if repeatFactor is 1, invalid
          if (repeatFactor === 1) {
            return null
          } else {
            hasProperMod = false
          }
        } else {
          // Invalid sign
          return null
        }
      } else {
        // There is no sign
        if (array[0][5]) {
          // If no sign, there should not be a modifier
          return null
        } else {
          // No sign; no modifier; legal... trip flag for output format later
          hasProperMod = false
        }
      }

      // Randomize for die result in the roll
      // - 'total' tracks numerical sum
      // - 'rolls' stores each result as a string for output
      let rolls = []

      for (var j = 0; j < +array[0][2]; j++) {
        let roll = Math.ceil(Math.random() * (+array[0][3]))

        // TODO: figure out a way to bold crits
        // if (roll === 1 || roll === +array[0][3]) {
        //   rolls.push(`<b>${roll}</b>`)
        // } else {
        //   rolls.push(`${roll}`)
        // }
        rolls.push(`${roll}`)

        total += roll
      }

      // Construct output... a bit different if no modifier
      if (hasProperMod) {
        result += `(${rolls.join(" + ")}) ${array[0][4]} ${modifier} = ${total}`
      } else {
        result += `(${rolls.join(" + ")}) = ${total}`
      }


      // If non-last repetition, include ; to delimit results in output
      if (repeatFactor !== 1 && i !== (repeatFactor - 1)) {
        result += "; "
      }
    }

    return result
  } else {
    // Sanity check fails
    return null
  }
}