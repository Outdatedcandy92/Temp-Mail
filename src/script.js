const formData = JSON.parse(localStorage.getItem('formData'));
const sandboxDomain = formData['sandbox-domain'];
const apikey = formData['apikey'];
const num = formData['number-of-items'];

async function listMail() {
    const emailsContainer = document.getElementById('emailsContainer');

    Array.from(emailsContainer.children).forEach(child => {
        if (!child.classList.contains('spinner-container')) {
            emailsContainer.removeChild(child);
        }
    });

    const spinnerContainer = document.querySelector('.spinner-container');
    spinnerContainer.style.display = 'flex';

    try {
        const response = await fetch(`https://api.mailgun.net/v3/${sandboxDomain}/events`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa('api:' + apikey)
            },
            params: {
                event: 'stored',
                limit: num * 2
            }
        });

        if (response.ok) {
            const data = await response.json();
            const events = data.items || [];
            if (events.length > 0) {
                let printedCount = 0;
                const emailsContainer = document.getElementById('emailsContainer');
                for (let i = 0; i < events.length && printedCount < num; i += 2) {
                    const event = events[i];
                    const storageUrl = event.storage.url;
                    const messageResponse = await fetch(storageUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic ' + btoa('api:' + apikey)
                        }
                    });

                    if (messageResponse.ok) {
                        const message = await messageResponse.json();
                        const nameMatch = message.From.match(/^(.*?)(?=\s*<)/);
                        const senderName = nameMatch ? nameMatch[0] : message.From;

                        const mailItem = document.createElement('div');
                        mailItem.className = 'mailitem';

                        const mailSentBy = document.createElement('div');
                        mailSentBy.className = 'mail-sent-by';
                        mailSentBy.textContent = senderName;

                        const mailSubject = document.createElement('div');
                        mailSubject.className = 'mail-subject';
                        mailSubject.textContent = message.Subject;

                        const mailTime = document.createElement('div');
                        mailTime.className = 'mail-time';
                        const emailtime = new Date(event.timestamp * 1000).toLocaleTimeString();
                        mailTime.textContent = emailtime;

                        mailItem.appendChild(mailSentBy);
                        mailItem.appendChild(mailSubject);
                        mailItem.appendChild(mailTime);

                        mailItem.addEventListener('click', () => {
                            openModal(message, emailtime);
                        });

                        emailsContainer.appendChild(mailItem);

                        printedCount++;
                    } else {
                        console.error(`Failed to fetch message: ${messageResponse.status}`);
                    }
                }
            } else {
                console.log("No new events found.");
            }
        } else {
            console.error(`Failed to fetch events: ${response.status}`);
            console.error(`Response: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error fetching emails:', error);
    } finally {
        spinnerContainer.style.display = 'none';
    }
}



function openModal(message, time) {
    const modal = document.getElementById('myModal');
    const modalText = document.getElementById('EmailText');
    const modalTime = document.getElementById('modalTime');
    const span = document.getElementsByClassName('close')[0];

    modalText.innerHTML = `

        <div class="email-from">
            <strong>From:</strong> ${message.From}<br>
        </div>
        <div class="email-subject">
            <strong>Subject:</strong> ${message.Subject}<br>
        </div>
        <div class="email-body">    
            <strong>Body:</strong> ${message['body-plain']}
        </div>    
    `;
    modalTime.innerHTML = `<strong>Time:</strong> ${time}`;
    modal.style.display = 'block';

    span.onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

let randomString = '';

function RandomAddr() {
    try {

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        randomString = '';
        for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters[randomIndex];
        }
        console.log('Generated random string:', randomString);

        return randomString;

    } catch (error) {
        console.error('Error in RandomAddr function:', error);
    }
}

function copyEmail() {
    try {
        const randomString = document.getElementById('Email').textContent;

        if (!randomString) {
            throw new Error('Random string is empty');
        }

        const final = randomString + '@' + sandboxDomain;
        navigator.clipboard.writeText(final).then(() => {
            console.log('Email copied to clipboard:', final);
            alert('Email copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy email to clipboard:', err);
        });
    } catch (error) {
        console.error('Error in copyEmail function:', error);
    }
}


function CustomNames(nameslist) {
    try {
        const namesInput = nameslist; // FIX: Add localstorage after test
        if (!namesInput) {
            throw new Error('namesInput not found');
        }

        const namesString = namesInput;
        if (!namesString) {
            throw new Error('No names provided in the input');
        }

        const namesArray = namesString.split(',').map(name => name.trim());
        console.log('Names array:', namesArray);

        const randomIndex = Math.floor(Math.random() * namesArray.length);
        const randomName = namesArray[randomIndex];
        console.log('Randomly selected name:', randomName);

        const [firstName, lastName] = randomName.split(' ');
        if (!firstName || !lastName) {
            throw new Error('Invalid name format. Each name should contain a first and last name');
        }
    
        const randomNumber = Math.floor(Math.random() * 1000); 
        const emailAddress = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber}`;
        console.log('Generated email address:', emailAddress);
    

        return emailAddress;



    } catch (error) {
        console.error('Error in CustomNames function:', error);
    }
}





function Startup() {
    const EmailAddr = document.getElementById('Email');


    const formData = JSON.parse(localStorage.getItem('formData'));
    console.log(formData);
    if (formData) {
        const customnames = formData['custom-names'];

        console.log('Sandbox Domain:', sandboxDomain);
        console.log('API Key:', apikey);
        console.log('Number of Items:', num);

        
        listMail();

        if (customnames === 'null') {
            console.log(customnames, 'is null');
            EmailAddr.innerHTML = RandomAddr();
            
        } else {
            //todo: logic for custom names (done)
            console.log(customnames);
            EmailAddr.innerHTML = CustomNames(customnames);

        }

    } else {
        alert('Please enter your sandbox domain and API key');
        window.location.href = 'settings.html';
    }
}


Startup();






async function ForwardTo(Email) {
    const url = `https://api.mailgun.net/v3/routes`;

    const route = {
        priority: 1,
        description: `Forward all emails to ${Email}`,
        expression: `match_recipient(".*@${sandboxDomain}")`,
        action: [`forward("${Email}")`, 'stop()']
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa('api:' + apiKey),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(route)
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Error creating route:', error);
    } else {
        const result = await response.json();
        console.log('Route created:', result);
    }
}