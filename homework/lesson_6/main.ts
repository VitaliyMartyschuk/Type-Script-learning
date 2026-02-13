//Визначте інтерфейс, який використовує сигнатуру індексу з типами об'єднання.
// Наприклад, тип значення для кожного ключа може бути число | рядок.

interface Vehicle {
 [  key: string]: string | number;
}

//Створіть інтерфейс, у якому типи значень у сигнатурі індексу є функціями. 
// Ключами можуть бути рядки, а значеннями — функції, які приймають будь-які аргументи.

interface Car {
    [key: string]: (...args: any[]) => any;
}

// Опишіть інтерфейс, який використовує сигнатуру індексу для опису об'єкта, подібного до масиву.
//  Ключі повинні бути числами, а значення - певного типу.

interface Bike {
    [index: number]:  string | number | boolean | Function;
}

// Створіть інтерфейс з певними властивостями та індексною сигнатурою. Наприклад, ви можете мати властивості 
// типу name: string та індексну сигнатуру для додаткових динамічних властивостей.

interface User {
    id: number;
    email: string;
    password: string;
    [key: string]: string | number | boolean;
}

 // Створіть два інтерфейси, один з індексною сигнатурою, а інший розширює перший, додаючи специфічні властивості.

interface Product {
    [key: string]: string | number;
}

interface VirtualProduct extends Product {
    price: number;
    sku: string;
    downloadLink: string
}

// апишіть функцію, яка отримує об'єкт з індексною сигнатурою і перевіряє, чи відповідають значення 
// певних ключів певним критеріям (наприклад, чи всі значення є числами).

interface Book {
    author: string;
    title: string;
    numberOfPages: number;
    [key: string]: string | number;
}
const fairyTales: Book = {
    author: "Hans Christian Andersen",
    title: "The Little Mermaid",
    numberOfPages: 96,
    genre: "Fantasy",
    publicationYear: 1837
}

function validateBook(book: Book): boolean {
    let result = true;
    if (!book.author && !book.title && !book.numberOfPages) {
        result = false;
    }

    for (const key in book) { 
        if (typeof book[key] === 'number' || typeof book[key] === 'string') {
            continue;
        } else {
            result = false;
        }
    }

    return result;
}

console.log(validateBook(fairyTales));