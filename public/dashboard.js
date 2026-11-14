// A lookup table so we can show the actual unit code instead of just "1" or "2"
const unitLookup = {
    1: "COMP 212",
    2: "SOEN 102"
};

// 1. Ask the backend for the data
fetch('/dashboard')
    .then(response => {
        if (!response.ok) {
            throw new Error("Waiting for team to create the JSON file");
        }
        return response.json();
    })
    .then(realData => {
        // 2. Render Progress
        const progressText = document.getElementById('progress-text');
        progressText.textContent = `${realData.progress.done} / ${realData.progress.total} assignments done`;

        // 3. Render Upcoming
        const upcomingList = document.getElementById('upcoming-list');
        upcomingList.innerHTML = ""; // Clear out any old HTML
        realData.upcoming.forEach(assignment => {
            const li = document.createElement('li');
            const unitCode = unitLookup[assignment.unit_id] || `Unit ${assignment.unit_id}`;
            
            li.innerHTML = `<span class="unit-code">[${unitCode}]</span> ${assignment.title} (Due: ${assignment.due_date})`;
            upcomingList.appendChild(li);
        });

        // 4. Render Overdue
        const overdueList = document.getElementById('overdue-list');
        overdueList.innerHTML = ""; // Clear out any old HTML
        realData.overdue.forEach(assignment => {
            const li = document.createElement('li');
            const unitCode = unitLookup[assignment.unit_id] || `Unit ${assignment.unit_id}`;
            
            li.style.color = "red";
            li.innerHTML = `<span class="unit-code">[${unitCode}]</span> ${assignment.title} (Due: ${assignment.due_date})`;
            overdueList.appendChild(li);
        });

    })
    .catch(error => {
        // If the backend fails (e.g. JSON file doesn't exist yet), show this message on the screen
        console.error("Dashboard error:", error);
        document.getElementById('progress-text').textContent = "Waiting for teammates to merge data.json...";
    });