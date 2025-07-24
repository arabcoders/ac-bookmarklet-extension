const str_keys = ["opts_url", "opts_apikey"]

if (typeof chrome === 'undefined') {
    let chrome = browser
}

const $ = s => document.querySelector(s)

const notify = (message, no_inline) => {
    if (!no_inline) {
        $('#error_msg').innerText = message;
        return
    }

    chrome.notifications.create({
        "type": "basic",
        "iconUrl": chrome.runtime.getURL("icons/icon-128.png"),
        "title": 'AC-Bookmarklet Extension',
        "message": message,
    });
}

const testConfig = async () => {
    $('#error_msg').innerText = "";

    let opts_url = $("#opts_url").value;
    if (!opts_url) {
        notify("Please enter a valid AC-Bookmarklet instance URL.");
        return false;
    }

    if (opts_url.endsWith('/')) {
        opts_url = opts_url.slice(0, -1);
    }

    try {
        new URL(opts_url);
    } catch (e) {
        notify("Invalid URL format. Please enter a valid AC-Bookmarklet instance URL.");
        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    const onError = error => console.log(`Error: ${error}`);
    str_keys.forEach(k => chrome.storage.sync.get(k).then(r => $(`#${k}`).value = r[k] || "", onError));
});

$("#opts_conf").addEventListener("submit", async e => {
    e.preventDefault();

    if (false === (await testConfig())) {
        return false;
    }

    let data = {}

    str_keys.forEach(key => data[key] = $(`#${key}`).value)
    chrome.storage.sync.set(data);

    notify("Saved options.", true);
    setTimeout(() => { try { window.close() } catch (e) { } }, 1000);
});
