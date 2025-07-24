const getOption = async (key, default_data) => {
    let item = await chrome.storage.sync.get(key);
    return item[key] ?? default_data;
}

if (typeof chrome === 'undefined') {
    let chrome = browser
}

const notify = message => chrome.notifications.create({
    "type": "basic",
    "iconUrl": chrome.runtime.getURL("icons/icon-128.png"),
    "title": 'AC-Bookmarklet Extension',
    "message": message
});

chrome.action.onClicked.addListener(async tab => {
    const instance_url = await getOption('opts_url', null);
    if (!instance_url) {
        notify("Please set the AC-Bookmarklet instance URL in the options.");
        return;
    }

    const url = tab.url;
    if (!url) {
        notify("No active tab found.");
        return;
    }

    try {
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const apiKey = await getOption('opts_apikey', null);
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const resp = await fetch(`${instance_url}/api/links`, {
            method: 'POST',
            cache: 'no-cache',
            headers: headers,
            body: JSON.stringify({
                url: tab.url,
                title: tab.title
            })
        })

        const json = await resp.json();

        if (json?.error?.message || json?.info?.message) {
            const respCode = json.error?.code || json.info?.code || '??';
            notify(`${respCode}: ${json.error?.message || json.info?.message}`);
            return;
        }

        notify(resp.ok ? "URL added." : "Failed to add URL. Please check the console for details.");
    } catch (e) {
        console.error(e);
        notify(`${error.status}: ${error.statusText}. ${e}`);
    };
});
