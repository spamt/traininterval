const body = document.querySelector('body')
const divResult = document.getElementById('div_result_area')
const divGlobalFrame = document.querySelector('#div_global_frame')
const divStatsHorizontal = document.getElementById('div_stats_horizontal')
const divStatsVertical = document.getElementById('div_stats_vertical')

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const instrument = 'piano'


//#region CLASSES

class NotesCollection {
    constructor(){
        this.list = []
    }

    add(note){
        this.list.push(note)
    }

    get(noteName){
        for (const note of this.list){
            if (note.name.toUpperCase() === noteName.toUpperCase()){
                return note
            }
        }
    }

    getRandomBetween(from, to){
        const index = Math.floor(Math.random() * (to)) + from
        return this.list[index]
        }
}

class Note {
    constructor(name, frequency){
        this.name = name
        this.frequency = frequency
        this.index = notesCollection.list.length 
        notesCollection.add(this)
    }

    play(duration) {
        duration = duration? duration : 0.5
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
      
        oscillator.type = "sine"; // Create sine wave (Piano-like sound)

        oscillator.frequency.setValueAtTime(this.frequency, audioContext.currentTime);
      
      
        // Connect the oscillator to the gain node
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
      
        // Fade out the sound after 0.5 seconds
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration)
      
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      }

      play_OLD2(duration) { // like xylophone, but notes break when they overlap
        duration = duration || 0.5; // Default to 0.5 seconds
    
        // Create audio nodes
        const baseOscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter(); // Low-pass filter for smoothing
    
        // Configure base oscillator (fundamental tone)
        baseOscillator.type = "sine"; // Smooth sine wave
        baseOscillator.frequency.setValueAtTime(this.frequency, audioContext.currentTime);
    
        // Connect base oscillator to gain node and filter
        baseOscillator.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(audioContext.destination);
    
        // Configure low-pass filter
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, audioContext.currentTime); // Lower cutoff for warmth
        filter.Q.value = 0.8; // Subtle resonance
    
        // Implement ADSR envelope
        const attackTime = 0.01; // Quick attack for hammer strike
        const decayTime = 0.2; // Slightly longer decay for natural resonance
        const sustainLevel = 0.5; // Lower sustain for a mellow sound
        const releaseTime = 0.6; // Smooth, longer release
    
        // Set initial gain to 0
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
        // Attack phase: Quick ramp to simulate hammer strike
        gainNode.gain.linearRampToValueAtTime(0.9, audioContext.currentTime + attackTime);
    
        // Decay phase: Gradually reduce gain
        gainNode.gain.linearRampToValueAtTime(sustainLevel, audioContext.currentTime + attackTime + decayTime);
    
        // Release phase: Fade out smoothly
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration + releaseTime);
    
        // Start and stop the oscillator
        baseOscillator.start(audioContext.currentTime);
        baseOscillator.stop(audioContext.currentTime + duration + releaseTime);
    }
    
    play_ALT3(duration) { // a bit more like a distorted guitar
        duration = duration || 0.5; // Default note duration
    
        // Create a fresh audio graph for this note
        const oscillator = audioContext.createOscillator(); // Fundamental tone
        const harmonicOscillator = audioContext.createOscillator(); // Subtle harmonic
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter(); // Low-pass filter
        const secondaryFilter = audioContext.createBiquadFilter(); // Secondary filter for extra smoothing
    
        // Configure oscillators
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(this.frequency, audioContext.currentTime);
    
        harmonicOscillator.type = "sine";
        harmonicOscillator.frequency.setValueAtTime(this.frequency * 1.5, audioContext.currentTime); // Lower harmonic
        harmonicOscillator.detune.value = 0.5; // Subtle detune
    
        // Connect nodes
        oscillator.connect(gainNode);
        harmonicOscillator.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(secondaryFilter);
        secondaryFilter.connect(audioContext.destination);
    
        // Configure low-pass filters
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(700, audioContext.currentTime); // Lower cutoff for warmth
        filter.Q.value = 0.7; // Gentle resonance
    
        secondaryFilter.type = "lowpass";
        secondaryFilter.frequency.setValueAtTime(600, audioContext.currentTime); // Extra smoothing
        secondaryFilter.Q.value = 1;
    
        // Configure ADSR envelope
        const attackTime = 0.02; // Slightly slower attack for natural strike
        const decayTime = 0.3; // Smooth decay
        const sustainLevel = 0.3; // Lower sustain for mellow sound
        const releaseTime = 0.6; // Smooth fade-out
    
        // Envelope: Start at 0 gain
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
        // Attack: Quick exponential curve for realism
        gainNode.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + attackTime);
    
        // Decay and Sustain
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel, audioContext.currentTime + attackTime + decayTime);
    
        // Release
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration + releaseTime);
    
        // Start and stop oscillators
        oscillator.start(audioContext.currentTime);
        harmonicOscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration + releaseTime);
        harmonicOscillator.stop(audioContext.currentTime + duration + releaseTime);
    
        // Optional: Add a faint noise burst for hammer strike
        
        const noise = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.02, audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1; // White noise
        }
        noise.buffer = noiseBuffer;
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        noise.connect(noiseGain).connect(audioContext.destination);
        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + 0.02);
        
    }
    
    
    

}

class IntervalsCollection{
    constructor(){
        this.listOfIntervals = []
        this.answerGiven
        this.correctAnswer
        this.root
        this.secondNote
        this.counter = new Counter()
        this.lastBarAdded = false

    }

    add(interval){
        this.listOfIntervals.push(interval)
    }

    get(intervalName){
        for (const interval of this.listOfIntervals){
            if (interval.name.toUpperCase() === intervalName.toUpperCase()){
                return interval
            }
        }
    }

    getRandom(){
        const index = Math.floor(Math.random() * (this.listOfIntervals.length))
        this.correctAnswer = this.listOfIntervals[index]
        }

    doAll(methodName, parametres){
        for (const interval of this.listOfIntervals){
            interval[methodName](parametres)
        }
    }

    clearAllAnswerButtonStyling(){
        this.doAll('removeClass','wrong_button')
        this.doAll('removeClass','correct_button')
        this.doAll('removeClass','scale_up')
        this.doAll('unshrink')

    }


    // CK HERE. WORK ON IT ANOTHER TIME
    divFly(){
        // const startingElement = document.querySelector('#div_verdict');
        const startingElement = this.correctAnswer.button.element;
        startingElement.style.zIndex = 2
        const startingPosition = startingElement.getBoundingClientRect(); 

        const endingPosition = this.lastBarAdded.getBoundingClientRect()
        
        const plane = document.createElement('div')
        plane.id = 'plane'
        
        // deal with colours
        // plane.style.backgroundColor = this.answerGiven === this.correctAnswer ? 'rgb(100, 190, 23)' : 'rgb(250, 0, 0)'
        const startColour = 'rgb(100, 190, 23)'
        const endColour = this.answerGiven === this.correctAnswer ? 'rgb(100, 190, 23)' : 'rgb(250, 0, 0)'
        document.documentElement.style.setProperty('--start-colour', startColour);
        document.documentElement.style.setProperty('--end-colour', endColour);

        
        plane.addEventListener('animationend', () => {
            this.correctAnswer.updateStatsLineBarsVertical(this.correctAnswer === this.answerGiven)
            plane.remove();
            button_next.makeClickable()
            // intervalsCollection.lastBarAdded.querySelector('div').classList.remove('hidden')
          });


        const startingPlaneHeight = startingPosition.height
        const staringPlaneWidth = startingPosition.width
        const endingPlaneHeight = 4 // made to match the height defined in style.css for .stack_correct and .stack_wrong
        const endingPlaneWidth =  document.querySelector('#last_bar_added').offsetWidth // made to match the width of the last bar added
        document.documentElement.style.setProperty('--start-width', `${staringPlaneWidth}px`);
        document.documentElement.style.setProperty('--end-width', `${endingPlaneWidth}px`);
        document.documentElement.style.setProperty('--start-height', `${startingPlaneHeight}px`);
        document.documentElement.style.setProperty('--end-height', `${endingPlaneHeight}px`);

        // plane.style.height = `${enginPlaneHeight}px`
        // plane.style.width = `${endingPlaneWidth}px`

        plane.style.left = `${startingPosition.x}px`
        plane.style.top = `${startingPosition.y}px`

        body.append(plane)

        document.documentElement.style.setProperty('--start-left', `${startingPosition.x}px`);
        document.documentElement.style.setProperty('--end-left', `${endingPosition.x}px`);
        document.documentElement.style.setProperty('--start-top', `${startingPosition.y}px`);
        document.documentElement.style.setProperty('--end-top', `${endingPosition.y}px`);

        plane.classList.add('fly')

    }

    async afterAnswerSelected(){ // when the user selects an answer
        //style the buttons
        for (const interval of this.listOfIntervals){
            if (interval === this.correctAnswer){
                interval.addClass('correct_button')
                interval.addClass('scale_up')
            }
            if (interval === this.answerGiven){
                interval.addClass('wrong_button')
                interval.addClass('scale_up')
            } 
            if (interval != this.correctAnswer && interval != this.answerGiven) {
                interval.addClass('shrink')
            }
        }
        answerButtonsCollection.makeAllUnclickable()
        // button_next.makeClickable()

        // create the report 
        const verdictPositive = this.answerGiven === this.correctAnswer
        const verdictColourClass = verdictPositive ? 'correct_answer' : 'wrong_answer'

        const reportVerdict = document.createElement('div')
        reportVerdict.id = 'div_verdict'
        divResult.appendChild(reportVerdict)
        reportVerdict.classList.add('result_line', 'emphasis', verdictColourClass)
        reportVerdict.textContent = verdictPositive ? 'Correct!' : 'Error!'

        const reportNotesPlayed = document.createElement('div')
        divResult.appendChild(reportNotesPlayed)
        reportNotesPlayed.classList.add('result_line')
        reportNotesPlayed.textContent = `${intervalsCollection.root.name} to ${this.secondNote.name}`

        const reportYouAnswered = document.createElement('div')
        divResult.appendChild(reportYouAnswered)
        reportYouAnswered.setAttribute('id','reportYouAnswered')
        reportYouAnswered.classList.add('result_line')
        if (verdictPositive){
            reportYouAnswered.innerHTML = `Correct: <span class="correct_answer">${this.correctAnswer.name}</span>   `
            const buttonPlayCorrect = new ReportButton({
                variableName: 'buttonPlayCorrect', 
                visibleName: this.answerGiven.tuneName, 
                parentDiv: 'reportYouAnswered', 
                isCorrect: true,
                behaviourOnClick:
                ()=>{
                    this.answerGiven.playTune()
                }
            })
            buttonPlayCorrect.makeClickable()

        } else {
            reportYouAnswered.innerHTML = `Wrong: <span class="wrong_answer">${this.answerGiven.name}</span>   `
    
            const buttonPlayCorrect = new ReportButton({
                variableName: 'buttonPlayCorrect', 
                visibleName: this.answerGiven.tuneName, 
                parentDiv: 'reportYouAnswered', 
                isCorrect: false,
                behaviourOnClick:
                ()=>{
                    this.answerGiven.playTune()
                }
            })
            buttonPlayCorrect.makeClickable()

            const reportCorrectAnswer = document.createElement('div')
            divResult.appendChild(reportCorrectAnswer)
            reportCorrectAnswer.setAttribute('id','reportCorrectAnswer')
            reportCorrectAnswer.classList.add('result_line')
            reportCorrectAnswer.innerHTML = `Correct: <span class="correct_answer">${this.correctAnswer.name}</span>   `
            const buttonPlayWrong = new ReportButton({
                variableName: 'buttonPlayWrong', 
                visibleName: this.correctAnswer.tuneName, 
                parentDiv: 'reportCorrectAnswer', 
                isCorrect: true,
                behaviourOnClick:
                ()=>{
                    this.correctAnswer.playTune()
                }
            })
            buttonPlayWrong.makeClickable()
        }


        // update the counters
        this.counter.increase() // this is the global counter
        this.correctAnswer.counter.increase()
        if (verdictPositive){
            this.counter.increaseCorrect()
            this.correctAnswer.counter.increaseCorrect()
        } else {
            this.counter.increaseWrong()
            this.correctAnswer.counter.increaseWrong()
        }


        // show the stats
        this.correctAnswer.updateStatsLineBarsHorizontal()
        
        
        // make an animation
        this.correctAnswer.setLastBarAdded(verdictPositive)
        this.divFly()



    }


}

class Interval{
    constructor(name, shortName, semitones, tuneName, tune){
        this.name = name
        this.shortName = shortName
        this.semitones = semitones
        this.tuneName = tuneName
        this.tune = tune
        intervalsCollection.add(this)
        // create button
        this.button = this.createButton()
        this.counter = new Counter()
        this.statsLineBarsHorizontal = this.createStatsLineHorizontal()
        this.statsLineBarsVertical = this.createStatsLineVertical()
    }


    removeClass(classToRemove){
        this.button.element.classList.remove(classToRemove)
    }
    
    addClass(classToAdd){
        this.button.element.classList.add(classToAdd)
    }

    addShrink(){
        if (this != intervalsCollection.answerGiven && this != intervalsCollection.correctAnswer ){
            this.button.element.classList.add('shrink')
        }
    }

    unshrink(){
        if (this.button.element.classList.contains('shrink')){
            this.addClass('unshrink')
            this.removeClass('shrink')
            this.button.element.addEventListener('animationend',()=>{
                this.removeClass('unshrink')
            })
        } 
    }

    createButton(){
        const newButton = new AnswerButton(this)
        return newButton
    }

    createStatsLineHorizontal(){
        const statsLineName = document.createElement('div')
        divStatsHorizontal.append(statsLineName)
        statsLineName.classList.add('stats_line_name')
        statsLineName.innerHTML = `${this.name}`
        
        const statsLineBars = document.createElement('div')
        divStatsHorizontal.append(statsLineBars)
        statsLineBars.classList.add('stats_line_bars_wrapper')
        
        return statsLineBars
    }

    updateStatsLineBarsHorizontal(){
        this.statsLineBarsHorizontal.innerHTML = ''
        
        const percentageCorrect = 100 * (this.counter.correct / this.counter.clicks)
        const percentageWrong = 100 * (this.counter.wrong / this.counter.clicks)

        const barCorrect = document.createElement('div')
        barCorrect.classList.add('stats_bar_correct', 'left_radius')
        barCorrect.style.flex = `0 0 ${percentageCorrect}%`
        this.statsLineBarsHorizontal.append(barCorrect)
        
        const barWrong = document.createElement('div')
        barWrong.classList.add('stats_bar_wrong', 'right_radius')
        barWrong.style.flex = `0 0 ${percentageWrong}%`
        this.statsLineBarsHorizontal.append(barWrong)

        //central radiuses
        if (percentageCorrect === 0){
            barWrong.classList.add('left_radius')
        }
        if (percentageWrong === 0){
            barCorrect.classList.add('right_radius')
        }

    }


    createStatsLineVertical(){
        // Create the column
        const stackColumn = document.createElement('div')
        divStatsVertical.append(stackColumn)
        stackColumn.classList.add('stack_column')
        
        // create the part with the name
        const stackName = document.createElement('div')
        stackColumn.append(stackName)
        stackName.classList.add('stack_name')
        stackName.innerHTML = `${this.shortName}`
        
        // create the part to host the bars
        const stackBars = document.createElement('div')
        stackColumn.append(stackBars)
        stackBars.classList.add('stack_bars')

        return stackBars
    }

    setLastBarAdded(verdictPositive){
        intervalsCollection.lastBarAdded = this.statsLineBarsVertical
        intervalsCollection.lastBarAdded.id = 'last_bar_added'
    }


    updateStatsLineBarsVertical(verdictPositive){
        this.statsLineBarsVertical.innerHTML = '' // cleat the column
        for (let i = 0 ; i <  this.counter.wrong; i++){
            const bar = document.createElement('div')
            this.statsLineBarsVertical.append(bar)
            bar.classList.add('stack_wrong')

            /// hide the last if the verdict is positive
            if (!verdictPositive && i === this.counter.correct){
                intervalsCollection.lastBarAdded = bar
                // bar.classList.add('hidden')
            }
        }
        
        for (let i = 0 ; i <  this.counter.correct; i++){
            const bar = document.createElement('div')
            this.statsLineBarsVertical.append(bar)
            bar.classList.add('stack_correct')

            /// hide the last if the verdict is positive
            if (verdictPositive && i === this.counter.correct){
                intervalsCollection.lastBarAdded = bar
                bar.classList.add('hidden')
            }
        }

        //CKHERE later improve the logic so that the bar flies to its own colour
        intervalsCollection.lastBarAdded = this.statsLineBarsVertical
    }



    async playInterval(){
        intervalsCollection.secondNote = notesCollection.list[intervalsCollection.root.index + this.semitones]
        await sleep(1000)
        intervalsCollection.secondNote.play()
    }

    async playTune(){

        // repeat
        intervalsCollection.root.play()
        this.playInterval()
        
        await sleep(2000)

        for (const step of this.tune){
            const halfStepsToAdd = step.semitones
            const indexOfNextNoteToPlay = intervalsCollection.root.index + halfStepsToAdd
            const nextNoteToPlay = notesCollection.list[indexOfNextNoteToPlay]
            const durationToPlay = step.duration
            nextNoteToPlay.play(durationToPlay)
            await sleep(durationToPlay * 1000)
        }
    }


}

class ButtonsCollection{
    constructor(){
        this.listOfButtons = []
    }

    add(item){
        this.listOfButtons.push(item)
    }

    makeAllClickable(){
        for (const button of this.listOfButtons){
            button.makeClickable()
        }
    }

    makeAllUnclickable(){
        for (const button of this.listOfButtons){
            button.makeUnclickable()
        }
    }
}

class Button{
    constructor({variableName, visibleName, parentDiv}){
        this.element = document.createElement('button')
        this.variableName = variableName
        this.visibleName = visibleName
        this.parentDiv = parentDiv
    }

    create(){
        buttonsCollection.add(this)
        this.element.textContent = this.visibleName
        this.element.classList.add('button')
        this.element.classList.add('unclickable')
        document.getElementById(this.parentDiv).append(this.element)
    }
    makeClickable(){
        this.element.classList.remove('unclickable')
    }

    makeUnclickable(){
        this.element.classList.add('unclickable')
    }
}

class CommandButton extends Button{
    constructor({variableName, visibleName, behaviourOnClick = () => {} , parentDiv = 'div_buttons_commands'}){
        super({variableName: variableName, visibleName: visibleName, parentDiv: parentDiv})
        this.create()
        this.behaviourOnClick = this.element.addEventListener('click', behaviourOnClick)
    }

    create(){
        super.create()
        commandButtonsCollection.add(this)
        this.element.classList.add('button_command')
    }

}

class ReportButton extends CommandButton{
    constructor({variableName, visibleName, behaviourOnClick = () => {} , parentDiv = 'div_buttons_commands', isCorrect}){
        super({variableName: variableName, visibleName: visibleName, parentDiv: parentDiv, behaviourOnClick: behaviourOnClick})
        this.element.classList.remove('button_command')
        this.element.classList.add('button_report')
        if (isCorrect){
            this.element.classList.add('correct_button')
        } else {
            this.element.classList.add('wrong_button')
        }
    }
}


class AnswerButton extends Button{
    constructor(interval){
        super({variableName: interval.name, visibleName: `${interval.name} (${interval.semitones})` , parentDiv: 'div_buttons_answers'})
        this.interval = interval
        this.create()
    }

    create(){
        super.create()
        answerButtonsCollection.add(this)
        this.element.classList.add('button_answer')

        // clicked on an answer
        this.element.addEventListener('click', ()=>{
            intervalsCollection.answerGiven = this.interval
            intervalsCollection.afterAnswerSelected()
        })
    }
}

class Counter {
    constructor(){
        this.clicks = 0
        this.correct = 0
        this.wrong = 0
    }

    increase(){
        this.clicks++
    }

    increaseCorrect(){
        this.correct++
    }

    increaseWrong(){
        this.wrong++
    }

    reset(){
        this.clicks = 0
        this.correct = 0
        this.wrong = 0
    }
}
//#endregion CLASSES



//#region FUNCTIONS
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


//#endregion FUNCTIONS


//#region SETUP
// create collections 
const buttonsCollection = new ButtonsCollection
const answerButtonsCollection = new ButtonsCollection
const commandButtonsCollection = new ButtonsCollection
const notesCollection = new NotesCollection()
const intervalsCollection = new IntervalsCollection()

// create buttons
const button_next = new CommandButton({variableName:'button_next', visibleName: 'Next', behaviourOnClick:
    ()=>{
        buttonsCollection.makeAllClickable()
        button_next.makeUnclickable()
        // clear the result area
        divResult.innerHTML = ''
        // clear the answer button styling 
        intervalsCollection.clearAllAnswerButtonStyling()
    
    
        // Select a random root
        intervalsCollection.root = notesCollection.getRandomBetween(rootFrom, rootTo)
        intervalsCollection.root.play()
    
        // select a random interval
        intervalsCollection.getRandom()
        intervalsCollection.correctAnswer.playInterval()
    }
})
button_next.makeClickable() // the only button that is clickable at the beginning
const button_repeat = new CommandButton({variableName:'button_repeat', visibleName: 'Repeat interval', behaviourOnClick:
    ()=>{
        intervalsCollection.root.play()
        intervalsCollection.correctAnswer.playInterval()
    }
})

// const button_show_answer = new CommandButton({variableName:'button_show_answer', visibleName: 'Show answer', behaviourOnClick:
//     ()=>{
//         intervalsCollection.afterAnswerSelected()
//         answerButtonsCollection.makeAllUnclickable()
//         button_next.makeClickable()
//     }
// })

const button_play_tune = new CommandButton({variableName:'button_play_tune', visibleName: 'Play tune', behaviourOnClick:
    ()=>{
        intervalsCollection.correctAnswer.playTune()
    }
})

// Frequency map for each note
const asharp3 = new Note("A#3", 233.08);
const b3 = new Note("B3", 246.94);
const c4 = new Note("C4", 261.63);
const csharp4 = new Note("C#4", 277.18);
const d4 = new Note("D4", 293.66);
const dsharp4 = new Note("D#4", 311.13);
const e4 = new Note("E4", 329.63);
const f4 = new Note("F4", 349.23);
const fsharp4 = new Note("F#4", 369.99);
const g4 = new Note("G4", 392.00);
const gsharp4 = new Note("G#4", 415.30);
const a4 = new Note("A4", 440.00);
const asharp4 = new Note("A#4", 466.16);
const b4 = new Note("B4", 493.88);
const c5 = new Note("C5", 523.25);
const csharp5 = new Note("C#5", 554.37);
const d5 = new Note("D5", 587.33);
const dsharp5 = new Note("D#5", 622.25);
const e5 = new Note("E5", 659.26);
const f5 = new Note("F5", 698.46);
const fsharp5 = new Note("F#5", 739.99);
const g5 = new Note("G5", 783.99);
const gsharp5 = new Note("G#5", 830.61);
const a5 = new Note("A5", 880.00);
const asharp5 = new Note("A#5", 932.33);
const b5 = new Note("B5", 987.77);
const c6 = new Note("C6", 1046.50);

// create intervals
const minor2 = new Interval('minor second', 'm2', 1, 'jaws', [
    {semitones: 0, duration: 0.25},
    {semitones: 1, duration: 0.25},
    {semitones: 0, duration: 0.25},
    {semitones: 1, duration: 0.25},
    {semitones: 0, duration: 0.25},
    {semitones: 1, duration: 0.25},
    {semitones: 0, duration: 0.25},
    {semitones: 1, duration: 0.25},
    ])

const major2 = new Interval('major second', 'M2', 2, 'frère jaques', [
    {semitones: 0, duration: 0.5},
    {semitones: 2, duration: 0.5},
    {semitones: 4, duration: 0.5},
    {semitones: 0, duration: 0.5},
    {semitones: 0, duration: 0.5},
    {semitones: 2, duration: 0.5},
    {semitones: 4, duration: 0.5},
    {semitones: 0, duration: 0.5},
    ])  

const minor3 = new Interval('minor third', 'm3', 3, 'lullaby', [
    {semitones: 0, duration: 0.25},
    {semitones: 0, duration: 0.25},
    {semitones: 3, duration: 0.5},
    {semitones: 0, duration: 0.25},
    {semitones: 0, duration: 0.25},
    {semitones: 3, duration: 0.5},
    {semitones: 0, duration: 0.25},
    {semitones: 3, duration: 0.25},
    {semitones: 8, duration: 0.5},
    {semitones: 7, duration: 0.5},
    {semitones: 5, duration: 0.25},
    {semitones: 5, duration: 0.5},
    {semitones: 3, duration: 0.5},
])

const major3 = new Interval('major third', 'M3', 4, 'oh when the saints', [
    {semitones: 0, duration: 0.25},
    {semitones: 4, duration: 0.25},
    {semitones: 5, duration: 0.25},
    {semitones: 7, duration: 0.5},
    {semitones: 0, duration: 0.25},
    {semitones: 4, duration: 0.25},
    {semitones: 5, duration: 0.25},
    {semitones: 7, duration: 0.5},
])

const perfect4 = new Interval('perfect fourth', 'P4', 5, 'στα σπίτια μας θα πάμε', [
    {semitones: 0, duration: 0.25}, 
    {semitones: 5, duration: 0.5},
    {semitones: 5, duration: 0.25}, 
    {semitones: 5, duration: 0.5}, 
    {semitones: 7, duration: 0.25}, 
    {semitones: 9, duration: 0.25}, 
    {semitones: 5, duration: 0.5}
])

const tritone = new Interval('tritone', 'TT', 6, 'the simpsons', [
    {semitones: 0, duration: 0.25}, 
    {semitones: 6, duration: 0.75},
    {semitones: 7, duration: 0.5}, 
])

const perfect5 = new Interval('perfect fifth', 'P5', 7, 'star wars', [
    {semitones: 0, duration: 0.5}, 
    {semitones: 7, duration: 0.5}, 
    {semitones: 5, duration: 0.25}, 
    {semitones: 4, duration: 0.25}, 
    {semitones: 2, duration: 0.25}, 
    {semitones: 12, duration: 0.5}, 
    {semitones: 7, duration: 0.5}, 
])

const minor6 = new Interval('minor sixth', 'm6', 8, 'the entertainers', [
    {semitones: -2, duration: 0.25}, 
    {semitones: -1, duration: 0.25}, 
    {semitones: 0, duration: 0.25}, 
    {semitones: 8, duration: 0.5}, 
    {semitones: 0, duration: 0.25}, 
    {semitones: 8, duration: 0.5}, 
    {semitones: 0, duration: 0.25}, 
    {semitones: 8, duration: 0.5}, 
])

const major6 = new Interval('major sixth', 'M6', 9, 'dashing through the snow', [
    {semitones: 0, duration: 0.25}, 
    {semitones: 9, duration: 0.25}, 
    {semitones: 7, duration: 0.25}, 
    {semitones: 5, duration: 0.25}, 
    {semitones: 0, duration: 0.5}, 
])

const minor7  = new Interval('minor seventh', 'm7', 10, "can't stop (RHCP) guitar riff", [
    {semitones: 0, duration: 0.25}, 
    {semitones: 10, duration: 0.5}, 
    {semitones: 0, duration: 0.25}, 
    {semitones: 10, duration: 0.5}, 
    {semitones: 0, duration: 0.25}, 
    {semitones: 10, duration: 0.5}, 
    {semitones: 0, duration: 0.25}, 
    {semitones: 10, duration: 0.75}, 
])

const major7 = new Interval('major seventh', 'M7', 11, "???", [])
//#endregion SETUP



//#region PARAMETRES
const rootFrom = notesCollection.get('c4').index // there are notes below C4 to allow for tunes
const rootTo = rootFrom + 11
//#endregion PARAMETRES


//2024 11 15 1032