

let query = localStorage.getItem("query") || "Please search something on the homepage";
document.getElementById("query").textContent = query;

async function loadResults() {
    try {
        const res = await fetch("results.json");
        const sites = await res.json();

        const q = query.toLowerCase().trim();
        const resultsContainer = document.getElementById("results");
        resultsContainer.innerHTML = "";

        const blockAI = localStorage.getItem("BlockAI") === "true";
        const blockNSFW = localStorage.getItem("BlockNSFW") === "true";
        const searchMode = localStorage.getItem("search") || "search";

        const filtered = sites.filter(site => {
            const url = site.url.toLowerCase();
            const title = (site.seo.title || "").toLowerCase();
            const matchesQuery = url.includes(q) || title.includes(q);
            if (!matchesQuery) return false;

            const flags = site.flags || {};
            if (blockAI && flags.ai) return false;
            if (blockNSFW && flags.nsfw) return false;

            return true;
        });

        if (filtered.length === 0) {
            resultsContainer.innerHTML = `
                <p style="color:white; padding:20px; font-size:1.2em;">
                    No results found for "${query}"
                </p>
            `;
            return;
        }

        if (searchMode === "lucky") {
            handleLuckyRedirect(filtered);
            return;
        }

        filtered.forEach(site => {
            const linkWrapper = document.createElement("a");
            linkWrapper.href = site.url;
            linkWrapper.target = "_blank";
            linkWrapper.className = "resultLink";

            const resultBox = document.createElement("div");
            resultBox.className = "result_box";

            const favicon = document.createElement("div");
            favicon.className = "favicon";
            const faviconImg = document.createElement("img");
            faviconImg.src = "https://www.google.com/s2/favicons?sz=64&domain_url=" + site.url;
            favicon.appendChild(faviconImg);

            const data = document.createElement("div");
            data.className = "data";

            const siteTitle = document.createElement("h3");
            siteTitle.textContent = site.seo.title;

            const siteUrl = document.createElement("p");
            siteUrl.textContent = site.url;

            data.appendChild(siteTitle);
            data.appendChild(siteUrl);

            resultBox.appendChild(favicon);
            resultBox.appendChild(data);
            linkWrapper.appendChild(resultBox);

            resultsContainer.appendChild(linkWrapper);
        });

    } catch (err) {
        console.error("Error fetching results:", err);
    }
}

loadResults();

function handleLuckyRedirect(results) {
    const resultsContainer = document.getElementById("results");
    const topFive = results.slice(0, 5);
    const choice = topFive[Math.floor(Math.random() * topFive.length)];

    const message = document.createElement("p");
    message.style.color = "white";
    message.style.padding = "20px";
    message.style.fontSize = "1.2em";
    message.textContent = "Finding something great for you...";
    resultsContainer.appendChild(message);

    setTimeout(() => {
        localStorage.setItem("search", "search");
        window.location.href = choice.url;
    }, 500);
}
