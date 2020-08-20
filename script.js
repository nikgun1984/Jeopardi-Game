let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const idArr = [];
    for (let i = 0; i < 6; i++) {
        const id = await axios.get('https://jservice.io/api/random');
        idArr.push(id.data[0].category.id);
    }
    return idArr;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const info = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    const clues = [];
    for (let i = 0; i < 5; i++) {
        const answer = info.data.clues[i].answer;
        const question = info.data.clues[i].question;
        const id = info.data.clues[i].id;
        const showing = null
        clues.push({
            showing,
            question,
            answer
        });
    }
    return {
        title: info.data.title,
        clues
    }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const ids = await getCategoryIds();
    const $table = $('table');
    const $row = $("<tr></tr>");
    $row.attr("id", "column-top");
    for (let i = 0; i < 6; i++) {
        const data = await getCategory(ids[i]);
        categories.push(data);
        $row.append(`<td scope="col" id="${i}" class="header-cell border border-light text-center align-middle text-light">${data.title.toUpperCase()}</td>`)
    }
    $table.append($row);

    for (let i = 0; i < 5; i++) {
        const $row = $('<tr class="data"></tr>');
        for (let j = 0; j < 6; j++) {
            const $cell = $(`<td scope="col" class="box text-center align-middle" data-id="${i}-${j}"><i class="fas fa-question-circle text-light fa-3x"></i></td>`);
            $row.append($cell);
        }
        $table.append($row);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    evt.preventDefault();
    const dataArr = $(this).attr('data-id').split('-');
    const x = dataArr[1];
    const y = dataArr[0];
    if (!categories[x].clues[y].showing) {
        categories[x].clues[y].showing = "question";
        $(this).empty();
        $(this).html(`<p class="text-light">${categories[x].clues[y].question.toUpperCase()}</p>`)
    } else if (categories[x].clues[y].showing == "question") {
        categories[x].clues[y].showing = "answer";
        $(this).empty();
        $(this).html(`<p class="text-warning">${categories[x].clues[y].answer.toUpperCase()}</p>`)
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("div#spinner").toggleClass('d-none');
    $("button#main").empty().attr('disabled');
    $("button#main").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`)
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("div#spinner").toggleClass('d-none');
    $("button#main").empty().removeAttr("disabled");
    $("button#main").text('RESET!!!');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    $("table").empty();
    categories = [];
    await fillTable();
    hideLoadingView()
}

/** On click of start / restart button, set up game. */
$("button#main").on("click", async function (e) {
    e.preventDefault();
    await setupAndStart();
})


/** On page load, add event handler for clicking clues */
$(document).on('click', '.table tr.data td', handleClick);