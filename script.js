    // LONDON Session Timer v2.1
    // Holiday engine intentionally omitted.
    // Session:
    // Pre Market:    07:00 - 08:00
    // Regular:       08:00 - 16:30
    // Post Market:   16:30 - 17:30
    // Time Zone: Europe/London

    const timer = document.getElementById("sessionTimer");
    const alertSound = new Audio("alert.mp3");

    let alertPlayed = false;
    let currentState = "";

    function formatTime(ms){
        const total = Math.max(0, Math.floor(ms/1000));
        const h = Math.floor(total/3600);
        const m = Math.floor((total%3600)/60);
        const s = total%60;

        return String(h).padStart(2,"0")+":"+
               String(m).padStart(2,"0")+":"+
               String(s).padStart(2,"0");
    }

    function playAlertOnce(){
        if(alertPlayed) return;
        alertPlayed = true;
        alertSound.currentTime = 0;
        alertSound.play().catch(()=>{});
    }

    function render(statusClass,statusText,phaseClass,phaseText,action,left,pulse){
        const pulseClass = pulse ? " pulse" : "";

        let html = "LONDON SESSION • ";
        html += '<span class="'+statusClass+pulseClass+'">'+statusText+"</span>";

        if(phaseText){
            html += ' <span class="'+phaseClass+pulseClass+'">('+phaseText+")</span>";
        }

        html += " • "+action+" "+formatTime(left);
        timer.innerHTML = html;
    }

    function stateChanged(state){
        if(currentState !== state){
            currentState = state;
            alertPlayed = false;
        }
    }

    function updateTimer(){

        const now = new Date();

        // Keep en-US so Date() parses consistently in Chromium browsers.
        const london = new Date(now.toLocaleString("en-US",{
            timeZone:"Europe/London"
        }));

        const day = london.getDay();

        const open = new Date(london);
        open.setHours(7,0,0,0);

        const preEnd = new Date(london);
        preEnd.setHours(8,0,0,0);

        const regularEnd = new Date(london);
        regularEnd.setHours(16,30,0,0);

        const close = new Date(london);
        close.setHours(17,30,0,0);

        if(day === 0 || day === 6){

            const next = new Date(open);

            if(day === 6){
                next.setDate(next.getDate()+2);
            }else{
                next.setDate(next.getDate()+1);
            }

            const left = next - london;

            stateChanged("weekend");
            if(left <= 60000) playAlertOnce();

            render("weekend","WEEKEND","","","OPENS IN",left,left<=60000);
            return;
        }

        if(london < open || london >= close){

            const next = new Date(open);

            if(london >= close){
                next.setDate(next.getDate()+1);
            }

            const left = next - london;

            stateChanged("closed");
            if(left <= 60000) playAlertOnce();

            render("closed","CLOSED","","","OPENS IN",left,left<=60000);
            return;
        }

        if(london < preEnd){

            const left = preEnd - london;

            stateChanged("premarket");
            if(left <= 60000) playAlertOnce();

            render("open","OPEN","premarket","PRE MARKET","REGULAR MARKET IN",left,left<=60000);
            return;
        }

        if(london < regularEnd){

            const left = regularEnd - london;

            stateChanged("regular");
            if(left <= 60000) playAlertOnce();

            render("open","OPEN","","","POST MARKET IN",left,left<=60000);
            return;
        }

        const left = close - london;

        stateChanged("postmarket");
        if(left <= 60000) playAlertOnce();

        render("open","OPEN","postmarket","POST MARKET","CLOSES IN",left,left<=60000);
    }

    updateTimer();
    setInterval(updateTimer,1000);
