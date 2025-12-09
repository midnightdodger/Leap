// Select the input and buttons
const searchInput = document.querySelector('#searchbar input');
const searchButton = document.getElementById('search_btn');
const luckyButton = document.getElementById('lucky_btn');


function handleSearch() {
    const query = searchInput.value;
    localStorage.setItem("query", query);
    alert("apple")
}
function handleLuckyClick() {null}
searchButton.addEventListener('click', handleSearch);
luckyButton.addEventListener('click', handleLuckyClick);

searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {}
});
