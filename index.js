const AXIOM = 'MI';

//const GOAL = 'MU';
const GOAL = 'MUUUUIIU'; // WARNING: System will not terminate if GOAL has Ni = 0 (mod 3) I's!

const MAX_THEOREM_LENGTH = 25;      // -1 for unbounded
const MAX_GENERATION_COUNT = -1    // -1 for unbounded

//-------------------------------------------------------------------

function _createTheoremDictionaryObj(from = null, byRule = null) {
  return {
    from,
    byRule
  };
}

function _applyRule(theorem, rule, _theoremDictionary) {
  const generatedTheoremsArray = rule(theorem);
  let filteredTheoremsArray = [];
  generatedTheoremsArray.forEach(newTheorem => {
    // Filter and store new theorems
    if (((MAX_THEOREM_LENGTH === -1) || (newTheorem.length <= MAX_THEOREM_LENGTH)) && 
        !_theoremDictionary.has(newTheorem)) {
      _theoremDictionary.set(newTheorem, _createTheoremDictionaryObj(theorem, rule.name));
      filteredTheoremsArray.push(newTheorem);
    }
  });
  return filteredTheoremsArray;
}

function _findReplace(s, findStr, replaceStr) {
  let result = [];
  let pos = 0;
  do {
    //console.log('pos:', pos);
    pos = s.indexOf(findStr, pos);
    if (pos != -1) {
      let pre = s.substring(0, pos);
      let post = s.substring(pos);
      let newPost = post.replace(findStr, replaceStr);
      result.push(pre + newPost)
      pos++;
    }
    //console.log('result:', result);
  } while (pos != -1);
  return result;
}

function _includesGoal(resultArray, goal = GOAL) {
  return resultArray.includes(goal);
}

function _printDerivation(theoremDictionary) {
  if (theoremDictionary.has(GOAL)) {
    // Collect the derivation steps
    let theorem = GOAL;
    let derivationSteps = new Map();
    while (theoremDictionary.has(theorem)) {
      const theoremInfo = theoremDictionary.get(theorem);
      derivationSteps.set(theorem, theoremInfo);
      theorem = theoremInfo.from;
    }

    // Print the axiom
    let step = 0;
    const reversedKeysArray = Array.from(derivationSteps.keys()).reverse();
    console.log(`${step++}: axiom -> ${reversedKeysArray[0]}`);

    // Print the derivation steps
    const reversedKeysArrayNoAxiom = reversedKeysArray.slice(1);
    reversedKeysArrayNoAxiom.forEach(key => {
      console.log(`${step++}: ${derivationSteps.get(key).byRule} -> ${key}`);
    });
  } else {
    console.error(`ERROR: theoremDictionary does not have '${GOAL}'!`);
  }
}

//-------------------------------------------------------------------

function isValidTheorem(theorem) {
  for (let i = 0; i < theorem.length; i++) {
    let c = theorem.charAt(i);
    if ((c !== 'M') && (c !== 'U') && (c !== 'I')) {
      return false;
    }
  }

  // Axiomatic validity (optional)
  if (!theorem.startsWith('M')) {
    return false;
  }

  return true;
}

function isValidGoal(goal) {
  // Termination requirement
  const iCount = goal.split('I').length - 1;
  if (iCount % 3 === 0) {
    console.error(`ERROR: ${GOAL} will never be derived!`);
    return false;
  }
  return isValidTheorem(goal);
}

function rule1(s) {
  let result = [];
  if (s.endsWith('I')) {
    result.push(s + 'U');
  }
  return result;
}

function rule2(s) {
  let result = [];
  if (s.startsWith('M')) {
    const x = s.substring(1);
    result.push(s + x);
  }
  return result;
}

function rule3(s) {
  return _findReplace(s, 'III', 'U');
}

function rule4(s) {
  return _findReplace(s, 'UU', '');
}

//-------------------------------------------------------------------

function generate(theoremsArray = [AXIOM], _genCount = 1, _theoremDictionary) {
  if (!_theoremDictionary) {
    // Initialize the dictionary
    _theoremDictionary = new Map();
    _theoremDictionary.set(theoremsArray[0], _createTheoremDictionaryObj());
  }

  //console.log('');
  console.log(`Generation ${_genCount}: ${theoremsArray.length} new theorem(s)`);
  //console.log('theoremsArray:', theoremsArray);

  let newTheoremsArray = [];
  theoremsArray.forEach(theorem => {
    if (!isValidTheorem(theorem)) {
      console.error(`ERROR: '${theorem}' is not a valid MIU-system theorem!`)
      return null;
    }
  
    // Apply the rules
    const rule1Results = _applyRule(theorem, rule1, _theoremDictionary);
    const rule2Results = _applyRule(theorem, rule2, _theoremDictionary);
    const rule3Results = _applyRule(theorem, rule3, _theoremDictionary);
    const rule4Results = _applyRule(theorem, rule4, _theoremDictionary);
  
    // Collect the new theorems
    newTheoremsArray = newTheoremsArray.concat(rule1Results).concat(rule2Results).concat(rule3Results).concat(rule4Results);
  });
  //console.log('newTheoremsArray:', newTheoremsArray);

  // Check the new theorems for the goal string. If not found, recurse.
  if (_includesGoal(newTheoremsArray)) {
    console.log('');
    console.log(`${GOAL} found after deriving ${_theoremDictionary.size} theorems!`);
    _printDerivation(_theoremDictionary);
    return _theoremDictionary;
  } else {
    if ((newTheoremsArray.length > 0) && 
        ((_genCount < MAX_GENERATION_COUNT) || (MAX_GENERATION_COUNT === -1))) {
      return generate(newTheoremsArray, _genCount + 1, _theoremDictionary);
    } else {
      console.log('');
      console.log(`'${GOAL}' not found after deriving ${_theoremDictionary.size} theorems!`);
      return _theoremDictionary;
    }
  }
}

//===================================================================

console.log(`Trying to derive ${GOAL}...`);
console.log('');

if (isValidGoal(GOAL)) {
  const theoremDictionary = generate();
  //console.log('theoremDictionary:', theoremDictionary);
}