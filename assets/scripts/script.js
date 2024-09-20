const books = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';



// INPUT BOOKS
function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const bookIsComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = putBook(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function putBook(id, title, author, year, isCompleted) {
    return {
        id, title, author, year, isCompleted
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // EVENT LISTENER SUBMIT
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    // EVENT LISTENER SEARCH
    const searchBook = document.getElementById("searchBook");
    searchBook.addEventListener("click", function (event) {
        event.preventDefault();
        searchBookFromBookshelf();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedReadList = document.getElementById('incompleteBookshelfList');
    uncompletedReadList.innerHTML = '';

    const completedReadList = document.getElementById('completeBookshelfList');
    completedReadList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = insertBook(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedReadList.append(bookElement);
        }
        else
            completedReadList.append(bookElement);
    }
});



// INSERT BOOK TO BOOKSHELF
function insertBook(bookObject) {
    const textBookTitle = document.createElement('h3');
    textBookTitle.innerText = bookObject.title;

    const textBookAuthor = document.createElement('p');
    textBookAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textBookYear = document.createElement('p');
    textBookYear.innerText = `Tahun: ${bookObject.year}`;

    const textContainer = document.createElement('article');
    textContainer.classList.add('book_item');
    textContainer.append(textBookTitle, textBookAuthor, textBookYear);
    textContainer.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('unread-button', 'green');
        unreadButton.innerText = 'Belum selesai dibaca'

        unreadButton.addEventListener('click', function () {
            addBookToUncompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button', 'red');
        trashButton.innerText = 'Hapus buku'

        trashButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        const actionButton = document.createElement('div');
        actionButton.classList.add('action');
        actionButton.append(unreadButton, trashButton);

        textContainer.append(actionButton);

    } else {
        const doneReadButton = document.createElement('button');
        doneReadButton.classList.add('doneRead-button', 'green');
        doneReadButton.innerText = 'Selesai dibaca'

        doneReadButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button', 'red');
        trashButton.innerText = 'Hapus buku'

        trashButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        const actionButton = document.createElement('div');
        actionButton.classList.add('action');
        actionButton.append(doneReadButton, trashButton);

        textContainer.append(actionButton);
    }

    return textContainer;
}



// BUTTON OPERATION
function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToUncompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    swal({
        title: "Apakah kamu yakin?",
        text: `Setelah dihapus, buku tidak dapat dikembalikan`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            if (bookTarget === -1) return;
            books.splice(bookTarget, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            swal("Buku berhasil dihapus!", {
                icon: "success",
            });
        }
    });
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;

}



// SEARCH
function searchBookFromBookshelf() {
    let valueSearch = document.getElementById('searchBookTitle').value;
    let bookData = document.getElementsByClassName('book_item');

    for (const bookItem of bookData) {
        let bookTitle = bookItem.innerText.toUpperCase();
        let searchBook = bookTitle.search(valueSearch.toUpperCase());

        if (searchBook != -1) {
            bookItem.style.display = ""
        } else {
            bookItem.style.display = "none";
        };
    }
}



// WEB STORAGE
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}