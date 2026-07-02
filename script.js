// LONDON Session Timer v2.0
// Holiday engine intentionally omitted.
// Session: 07:00-17:30 Europe/London

const SESSION_OPEN_HOUR = 7;
const SESSION_CLOSE_HOUR = 17;

const timer = document.getElementById("sessionTimer");

const alertSound = new Audio("alert.mp3");

let alertPlayed = false;
let currentState = "";

function formatTime(ms){
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return String(h).padStart(2, "0") + ":" +
           String(m).padStart(2, "0") + ":" +
           String(s).padStart(2, "0");
}

function playAlertOnce(){
    if(alertPlayed) return;

    alertPlayed = true;
    alertSound.currentTime = 0;
    alertSound.play().catch(()=>{});
}

function render(statusClass,statusText,phaseClass,phaseText,action,left,pulse){

    const pulseClass = pulse ? " pulse" : "";

    let html = 'LONDON SESSION • ';

    html += '<span class="' + statusClass + pulseClass + '">' + statusText + '</span>';

    if(phaseText){
        html += ' <span class="' + phaseClass + pulseClass + '">(' + phaseText + ')</span>';
    }

    html += ' • ' + action + ' ' + formatTime(left);

    timer.innerHTML = html;
}

function stateChanged(newState){
    if(currentState !== newState){
        currentState = newState;
        alertPlayed = false;
    }
}

function updateTimer(){

    const now = new Date();

    const london = new Date(now.toLocaleString("en-GB",{
        timeZone:"Europe/London"
    }));

    const day = london.getDay();

    // Session times
    const open = new Date(london);
    open.setHours(7,0,0,0);          // Pre Market opens

    const preEnd = new Date(london);
    preEnd.setHours(8,0,0,0);        // Regular Market opens

    const regularEnd = new Date(london);
    regularEnd.setHours(16,30,0,0);  // Regular Market closes

    const close = new Date(london);
    close.setHours(17,30,0,0);       // Post Market closes

    // WEEKEND
    if(day === 6 || day === 0){

        let next = new Date(open);

        if(day === 6){
            next.setDate(next.getDate() + 2);
        }else{
            next.setDate(next.getDate() + 1);
        }

        const left = next - london;

        stateChanged("weekend");

        if(left <= 60000){
            playAlertOnce();
        }

        render(
            "weekend",
            "WEEKEND",
            "",
            "",
            "OPENS IN",
            left,
            left <= 60000
        );

        return;
    }

    // CLOSED
    if(london < open || london >= close){

        let next = new Date(open);

        if(london >= close){
            next.setDate(next.getDate() + 1);
        }

        const left = next - london;

        stateChanged("closed");

        if(left <= 60000){
            playAlertOnce();
        }

        render(
            "closed",
            "CLOSED",
            "",
            "",
            "OPENS IN",
            left,
            left <= 60000
        );

        return;
    }

    // PRE MARKET
    if(london < preEnd){

        const left = preEnd - london;

        stateChanged("premarket");

        if(left <= 60000){
            playAlertOnce();
        }

        render(
            "open",
            "OPEN",
            "premarket",
            "PRE MARKET",
            "REGULAR MARKET IN",
            left,
            left <= 60000
        );

        return;
    }

    // REGULAR MARKET
    if(london < regularEnd){

        const left = regularEnd - london;

        stateChanged("regular");

        if(left <= 60000){
            playAlertOnce();
        }

        render(
            "open",
            "OPEN",
            "",
            "",
            "POST MARKET IN",
            left,
            left <= 60000
        );

        return;
    }

    // POST MARKET

    const left = close - london;

    stateChanged("postmarket");

    if(left <= 60000){
        playAlertOnce();
    }

    render(
        "open",
        "OPEN",
        "postmarket",
        "POST MARKET",
        "CLOSES IN",
        left,
        left <= 60000
    );

}

updateTimer();
setInterval(updateTimer,1000);
