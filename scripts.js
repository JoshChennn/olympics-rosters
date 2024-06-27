// Show more button
document.addEventListener("DOMContentLoaded", () => {
    const showMoreButton = document.getElementById('showMore');
    const tableContainer = document.querySelector('.table-container');
    const gradient = document.querySelector('.gradient');

    showMoreButton.addEventListener('click', () => {
        tableContainer.style.maxHeight = 'none';
        gradient.style.display = 'none';
        showMoreButton.style.display = 'none';
    });
});

// Popup
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.athlete-wrapper');
    const popup = document.getElementById('popup');
    const popupName = document.getElementById('popup-name');
    const popupText = document.getElementById('popup-text');
    const closeButton = document.querySelector('.close');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.getAttribute('data-name');
            const info = card.getAttribute('data-info');
            popupName.textContent = name;
            popupText.textContent = info;
            popup.style.display = 'flex';
        });
    });

    closeButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});

// Changing content by dropdown
const container = document.getElementById('top-section');
const dropdown = document.getElementById('team-select');
const defaultContent = document.getElementById('all-teams-content');
const sportsContent = document.getElementById('sports-content');
const flag = document.getElementById('flag-container');

dropdown.addEventListener('change', function() {
    const selectedOption = dropdown.value;

    if (selectedOption === 'all-teams') {
        defaultContent.style.display = 'block';
        sportsContent.style.display = 'none';
        dropdown.style.backgroundColor = '#262626';
        dropdown.style.color = '#F8F7F4';
        dropdown.style.backgroundImage = "url('images/dropdown-arrow.png')";
        backgroundDisplay.style.background = '';
        //flag.style.padding = '1080px';
    }
    else {
        defaultContent.style.display = 'none';
        sportsContent.style.display = 'block';
        dropdown.style.backgroundColor = '#F8F7F4';
        dropdown.style.color = '#262626';
        dropdown.style.backgroundImage = "url('images/dropdown-arrow-gray.png')";
        //flag.style.paddingBottom = '0px';

        const backgroundImageUrl = backgroundImage[selectedOption];
        backgroundDisplay.style.background = `url(${backgroundImageUrl}) no-repeat center center / cover`;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const backgroundSelector = document.getElementById('team-select');
    const backgroundDisplay = document.getElementById('top-section');

    const backgroundData = {
        'archery': 'https://firebasestorage.googleapis.com/v0/b/olympics-c5b48.appspot.com/o/usa%2Fsports%2Farchery.png?alt=media&token=c7c4dd34-e61b-4270-bcfd-8f4bff61f9c3',
        'artistic-gymnastics': 'https://firebasestorage.googleapis.com/v0/b/olympics-c5b48.appspot.com/o/usa%2Fsports%2Fgymnastics.png?alt=media&token=ada8b829-8bc5-4c9d-ac9e-c88f950df71b',
        'artistic-swimming': 'https://firebasestorage.googleapis.com/v0/b/olympics-c5b48.appspot.com/o/usa%2Fsports%2Fartistic_swimming.png?alt=media&token=fcbbbf4a-4d5c-4a34-8b10-0cccddc4fc27',
        'athletics': 'https://firebasestorage.googleapis.com/v0/b/olympics-c5b48.appspot.com/o/usa%2Fsports%2Ftrack.png?alt=media&token=7d23b9f8-6816-4fb6-8032-98dee80240fc',
        'badminton': 'https://firebasestorage.googleapis.com/v0/b/olympics-c5b48.appspot.com/o/usa%2Fsports%2Fbadminton.png?alt=media&token=a3ae000c-6147-459e-9202-db28de9ab6e7',
    };

    backgroundSelector.addEventListener('change', function() {
        const selectedValue = backgroundSelector.value;
        updateBackground(selectedValue);
    });

    function updateBackground(selectedValue) {
        if (selectedValue === 'all-teams') {
            backgroundDisplay.style.background = '';
        } else {
            const backgroundImageUrl = backgroundData[selectedValue];
            backgroundDisplay.style.background = `url(${backgroundImageUrl}) no-repeat center center / cover`;
        }
    }

    // Initialize with the "default" option
    updateBackground('all-teams');
});