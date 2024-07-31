const sandboxDomain = localStorage.getItem('sandboxDomain');
const apikey = localStorage.getItem('apikey');
const num = 5;

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
                        mailTime.textContent = new Date(event.timestamp * 1000).toLocaleTimeString();

                        mailItem.appendChild(mailSentBy);
                        mailItem.appendChild(mailSubject);
                        mailItem.appendChild(mailTime);


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






//TODO: create a start checkup function