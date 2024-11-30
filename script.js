
// Utility functions
const getLocalData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Navigation helpers
const navigateTo = (url) => window.location.href = url;
const loadTopics = () => getLocalData('topics');

// Index page logic
if (document.body.id === 'index-page') {
    const topicList = document.getElementById('topic-list');
    const noTopicsMsg = document.getElementById('no-topics-msg');

    const topics = loadTopics();

    if (topics.length === 0) {
        noTopicsMsg.style.display = 'block';
    } else {
        noTopicsMsg.style.display = 'none';
        topics.forEach(topic => {
            const newdiv = document.createElement('div');
            newdiv.className = 'topicdiv'
            const listItem = document.createElement('p');
            const duedate = document.createElement('p');
            listItem.textContent = `${topic.name}`;

            // calcualte the remaining time
            const today = new Date();
            const deadline = new Date(topic.deadline);
            const diff = deadline - today;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));


            duedate.textContent = `Deadline: ${days} days`;
            listItem.className = 'topic-list-item';
            duedate.className = 'topic-list-item-deadline';
            newdiv.addEventListener('click', () => {
                saveLocalData('currentTopic', topic);
                navigateTo('topic-details.html');
            });
            newdiv.appendChild(listItem);
            newdiv.appendChild(duedate);
            topicList.appendChild(newdiv);
        });
    }

    document.getElementById('add-topic-btn').addEventListener('click', () => {
        navigateTo('create-topic.html');
    });
}

// Create Topic page logic
if (document.body.id === 'create-topic-page') {
    const submitbutton = document.getElementById('submit-topic-btn');
    const optionsContainer = document.getElementById('options-container');
    const addOptionBtn = document.getElementById('add-option-btn');
    const cancelBtn = document.getElementById('cancel-btn');


    addOptionBtn.addEventListener('click', () => {
        const optionField = document.createElement('div');
        optionField.className = 'option-field';
        optionField.style.display = 'flex';
        optionField.innerHTML = `
            <input class="inputoptions" required placeholder="Option">
            <button type="button" class="delete-option-btn">Delete</button>
        `;
        optionField.querySelector('.delete-option-btn').addEventListener('click', () => optionField.remove());
        optionsContainer.appendChild(optionField);
    });

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('index.html');
    });

    submitbutton.addEventListener('click', (e) => {
        e.preventDefault();
        const topicName = document.getElementById('topic-name').value.trim();
        const options = Array.from(document.querySelectorAll('.inputoptions')).map(input => input.value.trim());
        const deadlinedate = new Date(document.getElementById('deadline').value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!topicName || options.length < 2 || new Set(options).size !== options.length) {
            alert('Please ensure the topic name is unique and there are at least two unique options.');
            return;
        }

        if (deadlinedate <= today) {
            alert('Please ensure the deadline is in the future.');
            return;
        }

        const topics = getLocalData('topics');
        if (topics.some(topic => topic.name === topicName)) {
            alert('A topic with this name already exists. Please choose a different name.');
            return;
        }

        topics.push({ name: topicName, options: options.map(option => ({ name: option, votes: 0 })), comments: [], finalized: false, userVotes: undefined, deadline: deadlinedate, sharedWith: [] });
        saveLocalData('topics', topics);

        navigateTo('index.html');
        alert('Topic created successfully! You can now share it from the topic details page!.');
        shareSection.style.display = 'block';
    });

}


// Topic Details page logic
if (document.body.id === 'topic-details-page') {
    const currentTopic = getLocalData('currentTopic');

    if (!currentTopic) {
        alert('No topic selected. Redirecting to home page.');
        navigateTo('index.html');
    }

    const dropdown = document.getElementById('options-dropdown');
    const voteBtn = document.getElementById('vote-btn');
    const commentsList = document.getElementById('comments-list');
    const finalizeTopicBtn = document.getElementById('finalize-topic-btn');
    const commentForm = document.getElementById('comment-form');
    const votesDisplay = document.getElementById('votes-display');
    const sharedWithList = document.getElementById('shared-with-list');
    const shareTopicBtn = document.getElementById('share-topic-btn');
    const finalizedMessage = document.createElement('p');
    const deadlineShow = document.getElementById('deadline');
    finalizedMessage.textContent = 'This topic has been finalized. Voting and commenting are now closed.';
    finalizedMessage.style.fontWeight = 'bold';
    finalizedMessage.style.color = 'red';
    finalizedMessage.style.textAlign = 'center';
    finalizedMessage.style.paddingBottom = '10px';

    const chosenOptionMessage = document.createElement('p');
    chosenOptionMessage.style.fontWeight = 'bold';

    const randomNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi"];

    // populate deadline and format it into a simple format without time
    deadlineShow.textContent = `Deadline: ${currentTopic.deadline.split('T')[0]}`;



    // Populate dropdown and votes
    document.getElementById('topic-name').textContent = currentTopic.name;
    currentTopic.options.forEach((option, index) => {
        const optionElem = document.createElement('option');
        optionElem.value = index;
        optionElem.textContent = `${option.name}`;
        dropdown.appendChild(optionElem);
    });

    const updateVotesDisplay = () => {
        votesDisplay.innerHTML = '';
        currentTopic.options.forEach((option, index) => {
            const voteElem = document.createElement('p');
            voteElem.textContent = `${option.name}: ${option.votes} votes`;
            votesDisplay.appendChild(voteElem);
        });
    };

     // Display "Shared With" list
     const displaySharedWith = () => {
        sharedWithList.innerHTML = '';
        if (currentTopic.sharedWith?.length === 0) {
            sharedWithList.innerHTML = '<li>No one has been shared with yet.</li>';
        } else {
            currentTopic.sharedWith.forEach(name => {
                const listItem = document.createElement('li');
                listItem.textContent = name;
                sharedWithList.appendChild(listItem);
            });
        }
    };

    // Share topic again
    shareTopicBtn.addEventListener('click', () => {
        const shareModal = document.createElement('div');
        shareModal.id = 'share-modal';
        shareModal.style.position = 'fixed';
        shareModal.style.top = '50%';
        shareModal.style.left = '50%';
        shareModal.style.transform = 'translate(-50%, -50%)';
        shareModal.style.backgroundColor = '#fff';
        shareModal.style.padding = '20px';
        shareModal.style.border = '1px solid #ccc';
        shareModal.style.borderRadius = '10px';
        shareModal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        shareModal.innerHTML = `
            <h4>Select People to Share With:</h4>
        `;

        const shareList = document.createElement('ul');
        randomNames.forEach(name => {
            const listItem = document.createElement('li');
            listItem.className = 'topicsharecheckbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = name;
            listItem.appendChild(document.createTextNode(name));
            listItem.appendChild(checkbox);
            shareList.appendChild(listItem);
        });
        shareModal.appendChild(shareList);

        const confirmShareBtn = document.createElement('button');
        confirmShareBtn.textContent = 'Confirm Sharing';
        confirmShareBtn.style.marginTop = '10px';
        shareModal.appendChild(confirmShareBtn);

        const closeModalBtn = document.createElement('button');
        closeModalBtn.textContent = 'Close';
        closeModalBtn.style.marginLeft = '10px';
        closeModalBtn.style.marginTop = '10px';
        shareModal.appendChild(closeModalBtn);

        document.body.appendChild(shareModal);

        // Handle Confirm Sharing
        confirmShareBtn.addEventListener('click', () => {
            const selectedNames = Array.from(shareList.querySelectorAll('input:checked')).map(input => input.value);
            if (selectedNames.length === 0) {
                alert('Please select at least one person to share with.');
                return;
            }

            // Update sharedWith array
            currentTopic.sharedWith = [...new Set([...(currentTopic.sharedWith || []), ...selectedNames])];
            saveLocalData('topics', loadTopics().map(t => t.name === currentTopic.name ? currentTopic : t));

            // Update Shared With List in UI
            displaySharedWith();

            // Display confirmation message
            alert(`Topic shared with: ${selectedNames.join(', ')}`);

            // Remove modal
            document.body.removeChild(shareModal);
        });

        // Handle Close Modal
        closeModalBtn.addEventListener('click', () => {
            document.body.removeChild(shareModal);
        });
    });

    const getChosenOption = () => {
        let maxVotes = -1;
        let chosenOption = 'No votes yet';
        currentTopic.options.forEach(option => {
            if (option.votes > maxVotes) {
                maxVotes = option.votes;
                chosenOption = option.name;
            }
        });
        return chosenOption;
    };




    // Handle voting
    // const userVotes = currentTopic.userVotes;
    voteBtn.addEventListener('click', () => {
        const selectedOptionIndex = dropdown.value;
        if (selectedOptionIndex === null) {
            alert('Please select an option to vote.');
            return;
        }

        // Update votes
        const previousVote = currentTopic.userVotes;
        if (previousVote !== undefined) {
            currentTopic.options[previousVote].votes -= 1;
        }
        
        currentTopic.options[selectedOptionIndex].votes += 1;
        currentTopic.userVotes = selectedOptionIndex;

        saveLocalData('topics', getLocalData('topics').map(t => t.name === currentTopic.name ? currentTopic : t));
        //saveLocalData('userVotes', userVotes);

        alert('Your vote has been updated!');
        updateVotesDisplay();
    });

    updateVotesDisplay();

    // Handle finalizing topic
    finalizeTopicBtn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to finalize this topic? This will close voting and commenting.')) return;
        currentTopic.finalized = true;

        const chosenOption = getChosenOption();
        chosenOptionMessage.textContent = `Chosen Option: ${chosenOption}`;

        saveLocalData('topics', getLocalData('topics').map(t => t.name === currentTopic.name ? currentTopic : t));
        alert('This topic has been finalized. Voting and commenting are now disabled.');

        dropdown.disabled = true;
        voteBtn.disabled = true;
        voteBtn.style.background = 'gray';
        commentForm.querySelector('button').disabled = true;
        finalizeTopicBtn.disabled = true;
        finalizeTopicBtn.style.background = 'gray';
        shareTopicBtn.disabled = true;
        shareTopicBtn.style.background = 'gray';
        document.getElementById("comment-input").disabled = true;
        commentForm.querySelector('button').style.background = 'gray';
        document.getElementById("topic-info").parentNode.insertBefore(finalizedMessage, document.getElementById('topic-info'));
        document.getElementById("topic-info").parentNode.insertBefore(chosenOptionMessage, document.getElementById('topic-info'));
    });

    // Load comments
    currentTopic.comments.forEach(comment => {
        const commentElem = document.createElement('li');
        commentElem.style.width = '90%';
        commentElem.style.overflowWrap = 'break-word';
        commentElem.textContent = `You (${comment.timestamp}):\n ${comment.text}`;
        commentsList.appendChild(commentElem);
    });

    commentForm.addEventListener('submit', e => {
        e.preventDefault();
        const commentInput = document.getElementById('comment-input').value.trim();
        if (!commentInput) return;

        const comment = {
            timestamp: new Date().toLocaleString(),
            text: commentInput
        };

        currentTopic.comments.push(comment);
        saveLocalData('topics', getLocalData('topics').map(t => t.name === currentTopic.name ? currentTopic : t));

        const commentElem = document.createElement('li');
        commentElem.style.width = '90%';
        commentElem.textContent = `You (${comment.timestamp}):\n ${comment.text}`;
        commentsList.appendChild(commentElem);

        document.getElementById('comment-input').value = '';
    });

    // Disable inputs if finalized
    if (currentTopic.finalized) {
        const chosenOption = getChosenOption();
        dropdown.disabled = true;
        voteBtn.disabled = true;
        voteBtn.style.background = 'gray';
        finalizeTopicBtn.disabled = true;
        finalizeTopicBtn.style.background = 'gray';
        shareTopicBtn.disabled = true;
        shareTopicBtn.style.background = 'gray';
        commentForm.querySelector('button').disabled = true;
        commentForm.querySelector('button').style.background = 'gray';
        document.getElementById("comment-input").disabled = true;
        chosenOptionMessage.textContent = `Chosen Option: ${chosenOption}`;
        document.getElementById("topic-info").parentNode.insertBefore(finalizedMessage, document.getElementById('topic-info'));
        document.getElementById("topic-info").parentNode.insertBefore(chosenOptionMessage, document.getElementById('topic-info'));
    }

    document.getElementById('go-back-btn').addEventListener('click', () => navigateTo('index.html'));
    document.getElementById('delete-topic-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
            const topics = loadTopics().filter(topic => topic.name !== currentTopic.name);
            saveLocalData('topics', topics);
            navigateTo('index.html');
        }
    });

    displaySharedWith();
}
