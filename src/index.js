const myLibrary = [];

const titleInput = document.querySelector('#book-title');
const authorInput = document.querySelector('#author-name');
const readInput = document.querySelector('#read-check');
const addNewBookBtn = document.querySelector('#add-book');
const removeAllBooksBtn = document.querySelector('#remove-all');
const bookContainer = document.querySelector('#book-information');
const table = document.querySelector('#lib-table');
const tableBody = document.querySelector('#book-body');
const hamburgerMenu = document.querySelector('.hamburger');
const navMenu = document.querySelector('.navbar');
const titleErrorMessage = document.querySelector('.title-input .error-message');
const authorErrorMessage = document.querySelector('.author-input .error-message');

// User Authorization
const urlSubstring = window.location.hash.substring(1);
const urlParam  = new URLSearchParams(urlSubstring);
const id_token = urlParam.get('id_token');
console.log(id_token);

// Event Listeners
addNewBookBtn.addEventListener('click', addBookToLibrary);
removeAllBooksBtn.addEventListener('click', removeAllBooks);
hamburgerMenu.addEventListener('click', () => {
  hamburgerMenu.classList.toggle('active');
  navMenu.classList.toggle('active');
})

/**
 *  Class function that provides book instances.
 * 
 * @param {*} title 
 *              The title of the book.
 * @param {*} author 
 *              The author of the book.
 */
class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
  }

  getInfo() {
    return `${this.title} by ${this.author}.`;
  }
}

async function fetchBooks() {
  try {
    const response = await fetch(`https://w38xh3waka.execute-api.us-east-1.amazonaws.com/Deployment/Books/GET`,
        {
          headers: {
            'Authorization':id_token
          }
        });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to fetch books');
    }
  } catch (error) {
    console.error('Error fetching books:', error.message);
    return [];
  }
}
console.log(fetchBooks());

async function displayLibrary() {
  tableBody.textContent = ''; // Clear existing table rows

  try {
    const books = await fetchBooks(); // Fetch books from the API

    if (books.length === 0) {
      const noBooksRow = document.createElement('tr');
      const noBooksCell = document.createElement('td');
      noBooksCell.colSpan = 4;
      noBooksCell.textContent = 'No books in the store yet.';
      noBooksRow.appendChild(noBooksCell);
      tableBody.appendChild(noBooksRow);
    } else {
      books.forEach((book, index) => {
        const newRow = document.createElement('tr');
        newRow.classList.add('body-row');

        const titleCell = document.createElement('td');
        titleCell.classList.add('body-cell');
        titleCell.textContent = book.Name;

        const authorCell = document.createElement('td');
        authorCell.classList.add('body-cell');
        authorCell.textContent = book.Author;

        const editCell = document.createElement('td');
        editCell.classList.add('body-cell');
        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-book-btn');
        editBtn.innerHTML = '✎';

        const removeCell = document.createElement('td');
        removeCell.classList.add('body-cell');
        const removeBookBtn = document.createElement('button');
        removeBookBtn.classList.add('remove-book-btn');
        removeBookBtn.innerHTML = '🞬';

        // Add event listeners to edit and remove buttons
        editBtn.addEventListener('click', () => editBook(index, myLibrary));
        removeBookBtn.addEventListener('click', () => removeBook(index));

        editCell.appendChild(editBtn);
        removeCell.appendChild(removeBookBtn);

        newRow.appendChild(titleCell);
        newRow.appendChild(authorCell);
        newRow.appendChild(editCell);
        newRow.appendChild(removeCell);

        tableBody.appendChild(newRow);
      });
    }
  } catch (error) {
    console.error('Error displaying library:', error.message);
  }
}

async function addBookToLibrary() {
  const title = titleInput.value;
  const author = authorInput.value;

  if (!validateFormBooks()) {
    return;
  }

  const newBook = { Name: title, Author: author }; // Create a book object

  try {
    const response = await fetch('https://w38xh3waka.execute-api.us-east-1.amazonaws.com/Deployment/Books/POST', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': id_token
      },
      body: JSON.stringify(newBook)
    });

    if (response.ok) {
      console.log('Book added successfully:', newBook);
      myLibrary.push(newBook); // Add the book to the local library array
      console.log(myLibrary);
      displayLibrary(); // Update the UI to display the updated library
      resetAllInputs(); // Reset input fields
    } else {
      throw new Error('Failed to add book');
    }
  } catch (error) {
    // Handle error if book addition fails
    console.error('Error adding book to library:', error.message);
  }
}

async function editBook(index) {
  const books = await fetchBooks();
  const newTitle = prompt('Enter new title:');
  const newAuthor = prompt('Enter new author:');

  if (newTitle !== null && newAuthor !== null) {
    if (books[index]) {
      const updatedBook = {
        ID: books[index].ID, // Assuming each book has an ID
        Name: newTitle,
        Author: newAuthor
      };

      try {
        const response = await fetch('https://w38xh3waka.execute-api.us-east-1.amazonaws.com/Deployment/Books/PUT/', {
          method: 'PUT', // Use PUT or PATCH depending on your API's requirements
          headers: {
            'Content-Type': 'application/json',
            'Authorization': id_token
          },
          body: JSON.stringify(updatedBook)
        });

        if (response.ok) {
          // Update the book in myLibrary array
          books[index].title = newTitle;
          books[index].author = newAuthor;
          displayLibrary(); // Update the UI to reflect changes
          console.log('Book updated successfully');
        } else {
          throw new Error('Failed to update book');
        }
      } catch (error) {
        console.error('Error updating book:', error.message);
      }
    } else {
      console.error('Book not found in library');
    }
  } else {
    console.log('Operation canceled by user or invalid input');
  }
}


async function removeBook(index) {
  if (confirm('Are you sure you want to remove this book?')) {
    try {
      // Fetch the book information from the API based on the provided index
      const books = await fetchBooks(); // Assuming fetchBooks function fetches all books from the API
      const bookToRemove = books[index];
      const ID = bookToRemove.ID; // Assuming each book has an ID
      console.log(ID);

      const response = await fetch(`https://w38xh3waka.execute-api.us-east-1.amazonaws.com/Deployment/Books/DELETE`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': id_token
      },
      body: JSON.stringify({ "ID": ID })
      });

      if (response.ok) {
        // If the book is successfully deleted from the API, remove it from the UI
        displayLibrary(); // Update the UI to reflect changes
        console.log('Book removed successfully from both API and UI');
      } else {
        throw new Error('Failed to remove book from API');
      }
    } catch (error) {
      console.error('Error removing book from API:', error.message);
    }
  } else {
    console.log('Remove operation canceled by user');
  }
}


// Utility Functions
function resetAllInputs() {
  titleInput.value = '';
  authorInput.value = '';
  titleErrorMessage.textContent = '';
  authorErrorMessage.textContent = '';
}

function validateFormBooks() {
  const title = titleInput.value;
  const author = authorInput.value;
  let isValid = true;

  if (!title) {
    showError(titleErrorMessage, 'Please give a valid title of the book');
    isValid = false;
  }   

  if (!author) {
    showError(authorErrorMessage, 'Please give a valid author');
    isValid = false;
  }

  return isValid;
}

function removeAllBooks() {
  tableBody.textContent = '';
  myLibrary.length = 0;
  displayLibrary();
  resetAllInputs();
}

function showError(errorElement, message) {
  errorElement.textContent = message;
}

displayLibrary();

// Testing if the method getInfo() from class Book, works properly as intended.
// const testBook1 = new Book('Harry Potter and the Philosopher\'s Stone', 'J.K Rowling', true);
// const testBook2 = new Book('Eloquent JavaScript', 'Marijin', false);
// console.log(testBook1.getInfo());
// console.log(testBook2.getInfo());

// console.log(fetchBooks());
// console.log(addBookToLibrary());

// function addBookToLibrary() {
//   title = titleInput.value;
//   author = authorInput.value;

//   if (!validateFormBooks()) {
//     return;
//   }
  
//   let newBook = new Book(title, author);
//   myLibrary.push(newBook);
//   displayLibrary();
//   resetAllInputs();
// }

// function displayLibrary() {
//   tableBody.textContent = '';
//   if (myLibrary.length == 0) {
//     const noBooksRow = document.createElement('tr');
//     const noBooksCell = document.createElement('td');
//     noBooksCell.colSpan = 4; 
//     noBooksCell.textContent = 'No books in the store yet.';
//     noBooksRow.appendChild(noBooksCell);
//     tableBody.appendChild(noBooksRow);
//   }
//   myLibrary.forEach((book, index) => {
//     const newRow = document.createElement('tr');
//     newRow.classList.add('body-row');

//     const titleCell = document.createElement('td');
//     titleCell.classList.add('body-cell');
//     titleCell.textContent = book.title;

//     const authorCell = document.createElement('td');
//     authorCell.classList.add('body-cell');
//     authorCell.textContent = book.author;

//     const editCell = document.createElement('td');
//     editCell.classList.add('body-cell');
//     const editBtn = document.createElement('button');
//     editBtn.classList.add('edit-book-btn');
//     editBtn.innerHTML = '✎';

//     const removeCell = document.createElement('td');
//     removeCell.classList.add('body-cell');
//     const removeBookBtn = document.createElement('button');
//     removeBookBtn.classList.add('remove-book-btn');
//     removeBookBtn.innerHTML = '🞬';

//     readBtn.addEventListener('click', () => toggleReadStatus(index));
//     editBtn.addEventListener('click', () => editBook(index));
//     removeBookBtn.addEventListener('click', () => removeBook(index));

//     statusCell.append(readBtn);
//     editCell.append(editBtn);
//     removeCell.append(removeBookBtn);
//     newRow.append(titleCell);
//     newRow.append(authorCell);
//     newRow.append(editCell);
//     newRow.append(removeCell);
//     tableBody.append(newRow);
//   });
// }

// function editBook(index) {
//   const newTitle = prompt('Enter new title:');
//   const newAuthor = prompt('Enter new author:');

//   if (newTitle && newAuthor !== null) {
//     myLibrary[index].title = newTitle;
//     myLibrary[index].author = newAuthor;
//     displayLibrary();
//   }
// }

// Default book instance example
// const defaultBook1 = new Book('Chaos', 'James Gleick', false);
// const defaultBook2 = new Book('The Fellowship of the Ring', 'J.R.R Tolkien', true);
// myLibrary.push(defaultBook1, defaultBook2);

// function removeBook(index) {
//   myLibrary.splice(index, 1);
//   displayLibrary();
// }


