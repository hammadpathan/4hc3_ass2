document.addEventListener('DOMContentLoaded', () => {
    // Detect the current page
    const isHomePage = document.getElementById('add-topic-btn') !== null;
    const isCreatePage = document.getElementById('new-topic-form') !== null;
    const isDetailsPage = document.getElementById('topic-name') !== null;

    if (isHomePage) {
        // Homepage functionality
        const addTopicBtn = document.getElementById('add-topic-btn');
        const topicList = document.getElementById('topic-list');
        const noTopicsMsg = document.getElementById('no-topics-msg');

        // Load topics from localStorage
        const loadTopics = () => {
            const topics = JSON.parse(localStorage.getItem('topics')) || [];
            topics.forEach((topic, index) => addTopicToList(topic.name, index));
            updateNoTopicsMessage();
        };

        // Update visibility of the "No topics" message
        const updateNoTopicsMessage = () => {
            noTopicsMsg.style.display = topicList.children.length === 0 ? 'block' : 'none';
        };

        // Add a topic to the list
        const addTopicToList = (name, index) => {
            const topicItem = document.createElement('li');
            topicItem.textContent = name;

            topicItem.addEventListener('click', () => {
                // Navigate to the topic details page
                window.location.href = `topic-details.html?index=${index}`;
            });

            topicList.appendChild(topicItem);
        };

        // Navigate to the create-topic page
        addTopicBtn.addEventListener('click', () => {
            window.location.href = 'create-topic.html';
        });

        // Load topics on page load
        loadTopics();
    }

    if (isCreatePage) {
        // Create-topic page functionality
        const form = document.getElementById('new-topic-form');
        const addOptionBtn = document.getElementById('add-option-btn');
        const optionsContainer = document.getElementById('options-container');
        const cancelBtn = document.getElementById('cancel-btn');

        addOptionBtn.addEventListener('click', () => {
            console.log('Adding new option field');
            const newOptionField = document.createElement('div');
            // newOptionField.classList.add('option-field');
            newOptionField.innerHTML = `
                <input class="topic-option" required placeholder="New Option">
                <button class="delete-option-btn">Delete</button>
            `;
            newOptionField.querySelector('.delete-option-btn').addEventListener('click', () => {
                newOptionField.remove();
            });
            optionsContainer.appendChild(newOptionField);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Check if at least one option is filled
            const options = Array.from(document.querySelectorAll('.topic-option')).map(input => input.value.trim());
            if (options.some(option => option !== '')) {
                const topicName = document.getElementById('topic-name').value;

                const topics = JSON.parse(localStorage.getItem('topics')) || [];
                topics.push({ name: topicName, options: options.map(option => ({ name: option, votes: 0 })), comments: [] });
                localStorage.setItem('topics', JSON.stringify(topics));

                window.location.href = 'index.html';
            } else {
                alert('Please fill in at least one option to create the topic.');
            }
        });

        cancelBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (isDetailsPage) {
        // Topic-details page functionality
        const topicNameElem = document.getElementById('topic-name');
        const optionsList = document.getElementById('options-list');
        const goBackBtn = document.getElementById('go-back-btn');
        const deleteTopicBtn = document.getElementById('delete-topic-btn');
        const commentForm = document.getElementById('comment-form');
        const commentInput = document.getElementById('comment-input');
        const commentsList = document.getElementById('comments-list');
        const voteBtn = document.getElementById('vote-btn');
        const optionsDropdown = document.getElementById('options-dropdown');
        const votesDisplay = document.getElementById('votes-display'); // Element for displaying vote counts
    
        const topicIndex = new URLSearchParams(window.location.search).get('index');
        const topics = JSON.parse(localStorage.getItem('topics')) || [];
        const topic = topics[topicIndex];
    
        topicNameElem.textContent = topic.name;
        
        // Display options in dropdown
        topic.options.forEach((option, index) => {
            const optionElem = document.createElement('option');
            optionElem.value = index;
            optionElem.textContent = option.name;
            optionsDropdown.appendChild(optionElem);
        });
    
        // Display separate vote counts
        topic.options.forEach((option, index) => {
            const voteCountElem = document.createElement('p');
            voteCountElem.textContent = `${option.name} - Votes: ${option.votes}`;
            votesDisplay.appendChild(voteCountElem);
        });
    
        // Voting functionality
        voteBtn.addEventListener('click', () => {
            const selectedOptionIndex = optionsDropdown.value;
            
            // If no option is selected, show alert
            if (selectedOptionIndex === '') {
                alert('Please select an option before voting!');
                return;
            }
    
            // Increment votes and update localStorage
            topic.options[selectedOptionIndex].votes += 1;
            localStorage.setItem('topics', JSON.stringify(topics));
    
            // Update the votes display to reflect new vote count
            const voteElements = votesDisplay.querySelectorAll('p');
            voteElements.forEach((elem, index) => {
                elem.textContent = `${topic.options[index].name} - Votes: ${topic.options[index].votes}`;
            });
        });
    
        // Display comments
        topic.comments.forEach(comment => {
            const commentElem = document.createElement('li');
            commentElem.textContent = comment;
            commentsList.appendChild(commentElem);
        });
    
        // Add new comment
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newComment = commentInput.value.trim();
            if (newComment !== '') {
                topic.comments.push(newComment);
                localStorage.setItem('topics', JSON.stringify(topics));
                const newCommentElem = document.createElement('li');
                newCommentElem.textContent = newComment;
                commentsList.appendChild(newCommentElem);
                commentInput.value = ''; // Clear the input
            }
        });
    
        goBackBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    
        deleteTopicBtn.addEventListener('click', () => {
            const confirmDelete = confirm('Are you sure you want to delete this topic?');
            if (confirmDelete) {
                topics.splice(topicIndex, 1);
                localStorage.setItem('topics', JSON.stringify(topics));
                window.location.href = 'index.html';
            }
        });
    }
    
});
