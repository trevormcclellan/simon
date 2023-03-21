function loadScores() {
    let scores = [];
    const scoresStr = localStorage.getItem('scores');
    if (scoresStr) {
        scores = JSON.parse(scoresStr);
    }

    const table = document.querySelector('#scores');

    if (scores.length) {
        for (const [i, score] of scores.entries()) {
            const positionTdEl = document.createElement('td');
            const nameTdEl = document.createElement('td');
            const scoreTdEl = document.createElement('td');
            const dateTdEl = document.createElement('td');

            positionTdEl.innerText = i + 1;
            nameTdEl.innerText = score.userName;
            scoreTdEl.innerText = score.score;
            dateTdEl.innerText = score.date;

            const rowEl = document.createElement('tr');
            rowEl.appendChild(positionTdEl);
            rowEl.appendChild(nameTdEl);
            rowEl.appendChild(scoreTdEl);
            rowEl.appendChild(dateTdEl);

            table.appendChild(rowEl);
        }
    }
    else {
        const rowEl = document.createElement('tr');
        const tdEl = document.createElement('td');
        tdEl.innerText = 'No scores yet';
        tdEl.setAttribute('colspan', 4);
        rowEl.appendChild(tdEl);
        table.appendChild(rowEl);
    }
}

loadScores();