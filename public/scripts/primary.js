var firebaseConfig = {
    apiKey: "AIzaSyC6WBb87ng8iqq4tiqRujhSmK1tpozfrCc",
    authDomain: "olympics-c5b48.firebaseapp.com",
    projectId: "olympics-c5b48",
    storageBucket: "olympics-c5b48.appspot.com",
    messagingSenderId: "202029431723",
    appId: "1:202029431723:web:e68aaf9b7b8458015cf0ee",
    measurementId: "G-Y0FYXEC525"
};

firebase.initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", function() {
    const teamsContainer = document.querySelector('.teams-list');
    const content = document.querySelector('.content');
    const mainContent = document.querySelector('.main-content');
    const playerDetails = document.createElement('div');
    playerDetails.className = 'player-details';
    let storyRotationInterval;

    mainContent.appendChild(playerDetails);

    const sports = [
        'Archery', 'Artistic Swimming', 'Badminton', 'Basketball', 'Basketball 3x3', 
        'Beach Volleyball', 'Boxing', 'Break Dancing', 'Canoeing', 'Sport Climbing',
        'Cycling', 'Diving', 'Equestrian', 'Fencing', 'Field Hockey', 'Golf', 
        'Gymnastics', 'Handball', 'Judo', 'Modern Pentathlon', 'Rhythmic Gymnastics', 
        'Rowing', 'Rugby', 'Sailing', 'Shooting', 'Skateboarding', 'Soccer', 
        'Surfing', 'Swimming', 'Table Tennis', 'Taekwondo', 'Tennis', 'Track and Field', 
        'Trampoline', 'Triathlon', 'Volleyball', 'Water Polo', 'Weightlifting', 'Wrestling'
    ];

    function displayInitialTeams(sports) {
        teamsContainer.innerHTML = '';
        sports.forEach(sport => {
            const div = document.createElement('div');
            div.className = 'team-item';
            div.innerHTML = `
                <span>${sport}</span>
                <img src="path/to/default/image.png" alt="Sport Image" class="lazy">
            `;
            div.addEventListener('click', () => {
                document.querySelectorAll('.team-item').forEach(item => item.classList.remove('selected'));
                div.classList.add('selected');
                displayLoadingMessage(sport);
                displayTeamDetails({ data: { display_name: sport, sport_image: 'path/to/default/image.png' } });
            });
            teamsContainer.appendChild(div);
        });
        showHome();
        lazyLoadImages();
    }

    async function fetchAndUpdateTeams() {
        try {
            const response = await fetch('https://us-central1-olympics-c5b48.cloudfunctions.net/api/getTeams');
            const teams = await response.json();
            updateTeamsWithOfficialData(teams);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }

    async function updateTeamsWithOfficialData(teams) {
        teamsContainer.innerHTML = '';
        for (const team of teams) {
            const div = document.createElement('div');
            div.className = 'team-item';
            const imageUrl = await getCachedImageUrl(team.data.sport_image);
            div.innerHTML = `
                <span>${team.data.display_name}</span>
                <img data-src="${imageUrl}" alt="Sport Image" class="lazy">
            `;
            div.addEventListener('click', () => {
                document.querySelectorAll('.team-item').forEach(item => item.classList.remove('selected'));
                div.classList.add('selected');
                displayTeamDetails(team);
            });
            teamsContainer.appendChild(div);
        }
        lazyLoadImages();
    }

    function displayLoadingMessage(sport) {
        playerDetails.style.display = 'none';
        playerDetails.style.opacity = 0;
        content.style.flexDirection = 'column';
        content.style.width = '100%';
        playerDetails.style.width = '0';
        content.innerHTML = `
            <div class="loading-message">Loading ${sport}...</div>
        `;
        history.pushState(null, '', `#${sport.replace(/\s+/g, '-')}`);
    }

    async function displayTeamDetails(team) {
        playerDetails.style.display = 'none';
        playerDetails.style.opacity = 0;
        content.style.flexDirection = 'column';
        content.style.width = '100%';
        playerDetails.style.width = '0';
        const imageUrl = await getCachedImageUrl(team.data.sport_image);
        content.innerHTML = `
            <div class="team-header" id="team-header">
                <img src="${imageUrl}" alt="Sport Image">
                <div>
                    <h2>${team.data.display_name}</h2>
                    <p class="team-description">${team.data.description}</p>
                </div>
            </div>
            <div class="team-content">
                <div class="loading-message">Loading athletes...</div>
            </div>
        `;
        lazyLoadImages(); // Ensure images are loaded
        history.pushState(null, '', `#${team.data.display_name.replace(/\s+/g, '-')}`);
        const response = await fetch(`https://us-central1-olympics-c5b48.cloudfunctions.net/api/getAthletes?sport=${team.id}`);
        const athletes = await response.json();
        displayAthletes(athletes, team.data.display_name);
    }

    async function displayAthletes(athletes, teamName) {
        const athletesByEvent = {};
        athletes.forEach(athlete => {
            athlete.data.event.forEach(event => {
                if (!athletesByEvent[event]) {
                    athletesByEvent[event] = [];
                }
                athletesByEvent[event].push(athlete);
            });
        });

        const teamContent = document.querySelector('.team-content');
        teamContent.innerHTML = '';

        for (const event in athletesByEvent) {
            const eventHeader = document.createElement('div');
            eventHeader.className = 'event-header';
            eventHeader.textContent = event;
            teamContent.appendChild(eventHeader);

            athletesByEvent[event].sort((a, b) => a.data.name.localeCompare(b.data.name));

            const eventList = document.createElement('div');
            eventList.className = 'event-list fade-in';
            athletesByEvent[event].forEach(async athlete => {
                const div = document.createElement('div');
                div.className = 'player-item';
                const imageUrl = await getCachedImageUrl(athlete.data.profile_image);
                console.log("using: ", imageUrl);
                div.innerHTML = `
                    <img src="${imageUrl}" alt="Profile Image">
                    <span>${athlete.data.name}</span>
                `;
                div.addEventListener('click', () => {
                    document.querySelectorAll('.player-item').forEach(item => item.classList.remove('selected'));
                    div.classList.add('selected');
                    displayPlayerDetails(athlete, teamName);
                });
                eventList.appendChild(div);
            });
            teamContent.appendChild(eventList);
        }
        document.querySelector('.team-content').style.opacity = 1;
        lazyLoadImages(); // Ensure images are loaded
    }

    async function displayPlayerDetails(athlete, teamName) {
        playerDetails.style.display = 'flex';
        playerDetails.style.flexDirection = 'column';
        playerDetails.style.overflowY = 'auto';
        content.style.width = '300px';
        playerDetails.style.width = 'calc(100% - 400px)';
        playerDetails.innerHTML = '<div class="loading-message">Loading athlete...</div>';
        document.getElementById('team-header').style.height = "100px";
        let profileImageUrl = '';
        let headerImageUrl = '';

        document.querySelectorAll('.player-item span').forEach(span => {
            span.classList.add('reduced-width');
        });

        const teamDescription = document.querySelector('.team-description');
        if (teamDescription) {
            teamDescription.style.display = 'none';
        }

        try {
            profileImageUrl = await getCachedImageUrl(athlete.data.profile_image);
        } catch (error) {
            console.log('No profile photo found');
        }

        try {
            headerImageUrl = await getCachedImageUrl(athlete.data.header_image);
        } catch (error) {
            console.log('No header photo found');
        }

        playerDetails.innerHTML = `
            <div class="player-header">
                ${headerImageUrl ? `<img src="${headerImageUrl}" alt="Header Image">` : ''}
                <div>
                    <h2>${athlete.data.name}</h2>
                    <p>${athlete.data.hometown}</p>
                </div>
            </div>
            <div class="player-content fade-in">
                ${profileImageUrl ? `<img src="${profileImageUrl}" alt="Profile Image">` : ''}
                <p class='previous-olympics'><strong>Previous Olympics:</strong> ${athlete.data.previous_olympics ?? 0}</p>
                <p class='athlete-description'><strong>Description:</strong> ${athlete.data.description}</p>
                <a href="${athlete.data.instagram}" target="_blank">Instagram</a>
            </div>
        `;

        playerDetails.classList.add('fade-in');
        playerDetails.style.opacity = 1;

        history.pushState(null, '', `#${teamName.replace(/\s+/g, '-')}/${athlete.data.name.replace(/\s+/g, '-')}`);
        console.log("Player details loaded:", athlete.data.name);
        lazyLoadImages();
    }

    async function getCachedImageUrl(gsUrl) {
        if (!gsUrl) return '';
        const cachedUrl = localStorage.getItem(gsUrl);
        if (cachedUrl) {
            return cachedUrl;
        }
        try {
            const url = await firebase.storage().refFromURL(gsUrl).getDownloadURL();
            localStorage.setItem(gsUrl, url);
            return url;
        } catch (error) {
            console.error('Error fetching image URL:', error);
            return '';
        }
    }

    function lazyLoadImages() {
        const lazyImages = document.querySelectorAll('.lazy');
        const config = {
            rootMargin: '0px 0px 50px 0px',
            threshold: 0.01
        };

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = () => img.classList.add('loaded');
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, config);

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    }

    const stories = [
        { image: './storage/walkerzimmerman.png', title: "USA Names Men's Soccer Team", description: 
            "As of July 8th, USA Soccer named its 18 man roster for the Paris Olympics. The squad will be led by US Men's Under-23 coach Marko Mitrović. The team includes notable players such as Walker Zimmerman (pictured), Djordje Mihailovic, and 19-year old Benjamin Cremaschi." },
        { image: './storage/lebronjames.png', title: 'Lebron is Back!', description: 
            'Lebron James will be competing after a 12 year hiatus in his fourth Olympics, having won bronze in Athens in 2004, gold in Beijing in 2008, and another gold in London in 2012. At 39 years old, his consistent 2 decade domination of Basketball is incredible.' },
        { image: './storage/kerryandanniexu.png', title: 'Olympic Twins', description: 
            "Annie and Kerry Xu have been side by side since before they were born. They're still side by side competing in Women's double's Badminton. They grew up in San Jose, attended UC Berkeley, and now both work for big 4 accounting firms. They are 22." }
    ];
    let currentStoryIndex = 0;

    const quizQuestions = [
        {
            question: "What year was the first modern Olympics held?",
            options: ["1896", "1900", "1912", "1920"],
            correct: 0,
            image: './storage/firstolympics.png'
        },
        {
            question: "Which country hosted the 2008 Olympics?",
            options: ["China", "USA", "UK", "Australia"],
            correct: 0,
            image: './storage/2008olympics.png'
        },
        {
            question: "Which sport is Michael Phelps known for?",
            options: ["Running", "Swimming", "Cycling", "Gymnastics"],
            correct: 1,
            image: './storage/michaelphelps.png'
        }
    ];
    let currentQuestionIndex = 0;
    let score = 0;

    function rotateStories() {
        const storyImage = document.querySelector('.box-1 img');
        const storyTitle = document.querySelector('.box-1 .title');
        const storyDescription = document.querySelector('.box-1 .description');

        if (!storyImage || !storyTitle || !storyDescription) {
            stopStoryRotation(); // Stop rotation if elements are not available
            return;
        }

        currentStoryIndex = (currentStoryIndex + 1) % stories.length;
        storyImage.src = stories[currentStoryIndex].image;
        storyTitle.textContent = stories[currentStoryIndex].title;
        storyDescription.textContent = stories[currentStoryIndex].description;
    }

    function startStoryRotation() {
        stopStoryRotation();
        storyRotationInterval = setInterval(rotateStories, 3000); // Rotate every 3 seconds
    }

    function stopStoryRotation() {
        if (storyRotationInterval) {
            clearInterval(storyRotationInterval);
        }
    }

    function buildQuiz() {
        const box2 = document.querySelector('.box-2');
        if (box2) {
            box2.innerHTML = `
                <div class="quiz-question">${quizQuestions[0].question}</div>
                <img src="${quizQuestions[0].image}" alt="Quiz Image">
                <div class="quiz-options">
                    <div class="quiz-option">1896</div>
                    <div class="quiz-option">1900</div>
                    <div class="quiz-option">1912</div>
                    <div class="quiz-option">1920</div>
                </div>
            `;
            showNextQuestion();
        }
    }

    function showNextQuestion() {
        if (currentQuestionIndex < quizQuestions.length) {
            const question = quizQuestions[currentQuestionIndex];
            document.querySelector('.box-2 .quiz-question').textContent = question.question;
            const options = document.querySelectorAll('.box-2 .quiz-option');
            options.forEach((option, index) => {
                option.textContent = question.options[index];
                option.classList.remove('correct', 'wrong');
                option.onclick = () => {
                    if (index === question.correct) {
                        option.classList.add('correct');
                        score++;
                    } else {
                        option.classList.add('wrong');
                        document.querySelectorAll('.box-2 .quiz-option')[question.correct].classList.add('correct');
                    }
                    setTimeout(() => {
                        currentQuestionIndex++;
                        showNextQuestion();
                    }, 1000);
                };
            });
            const quizImage = document.querySelector('.box-2 img');
            if (quizImage) {
                quizImage.src = question.image;
            }
        } else {
            showQuizResults();
        }
    }

    function showQuizResults() {
        document.querySelector('.box-2').innerHTML = `
            <div class="quiz-results">
                <h2>Your Score: ${score}/${quizQuestions.length}</h2>
                <img src="./storage/rings.png" id="quiz-done-img">
                <button id="restart-quiz-button">New Quiz</button>
            </div>
        `;
        document.querySelector('#restart-quiz-button').onclick = restartQuiz;
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        buildQuiz();
    }

    function initializeCountdown() {
        const countdownElement = document.querySelector('.countdown-timer');
        const targetDate = new Date('July 26, 2024 13:30:00').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                countdownElement.textContent = "The Olympic ceremony has started!";
                clearInterval(countdownInterval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // initial call to display countdown immediately
    }

    window.showHome = function() {
        const content = document.querySelector('.content');
        const playerDetails = document.querySelector('.player-details');

        content.style.display = 'block';
        content.style.flexDirection = 'column';
        content.style.width = '100%';
        playerDetails.style.width = '0';
        playerDetails.style.display = 'none';
        playerDetails.classList.remove('fade-in');

        content.innerHTML = `
            <div class="home-container">
                <div class="welcome-container">
                    <div class="welcome-message">
                        <h2>USA Olympic Athletes</h2>
                    </div>
                    <div class="flags">
                        <img src="./storage/usaflag.svg" alt="USA Flag">
                        <img src="./storage/rings.png" alt="Olympic Rings">
                    </div>
                </div>
                <div class="content-container">
                    <div class="box-1">
                        <img src="${stories[0].image}" alt="Featured Story">
                        <div class="title">${stories[0].title}</div>
                        <div class="description">${stories[0].description}</div>
                    </div>
                    <div class="box-2">
                        <div class="quiz-question">${quizQuestions[0].question}</div>
                        <img src="${quizQuestions[0].image}" alt="Quiz Image">
                        <div class="quiz-options">
                            <div class="quiz-option">1896</div>
                            <div class="quiz-option">1900</div>
                            <div class="quiz-option">1912</div>
                            <div class="quiz-option">1920</div>
                        </div>
                    </div>
                    <div class="box-3">
                        <div class="news">
                            <div class="news-item">
                                <div class="description">Description of news item 1</div>
                                <div class="date">01/01/2024</div>
                            </div>
                            <div class="news-item">
                                <div class="description">Description of news item 2</div>
                                <div class="date">02/01/2024</div>
                            </div>
                            <!-- More news items -->
                        </div>
                        <div class="medals">
                            <div>
                                <img src="./storage/goldmedal.png" alt="Gold Medal">
                                <div class="medal-count">10</div>
                            </div>
                            <div>
                                <img src="./storage/silvermedal.png" alt="Silver Medal">
                                <div class="medal-count">5</div>
                            </div>
                            <div>
                                <img src="./storage/bronzemedal.png" alt="Bronze Medal">
                                <div class="medal-count">7</div>
                            </div>
                            <div id="countdown-box">
                                <p>Countdown to Torch Ceremony</p>
                                <div class="countdown-timer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        startStoryRotation();
        buildQuiz();
        initializeCountdown();

        document.querySelectorAll('.player-item span').forEach(span => {
            span.classList.remove('reduced-width');
        });
        document.querySelectorAll('.team-item').forEach(item => item.classList.remove('selected'));
        history.pushState(null, '', '#home');
    };

    window.onhashchange = function() {
        if (location.hash === '#home') {
            startStoryRotation();
            content.style.overflow = 'hidden'; // Prevent scrolling on home page
        } else {
            stopStoryRotation();
            content.style.overflow = 'auto'; // Allow scrolling on other pages
        }
    };

    displayInitialTeams(sports);
    fetchAndUpdateTeams();
});
