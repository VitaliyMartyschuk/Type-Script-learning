/*
Вам необхідно написати додаток Todo list. У списку нотаток повинні бути методи для додавання нового запису, видалення, редагування та отримання повної інформації про нотатку за ідентифікатором, а так само отримання списку всіх нотаток. Крім цього, у користувача має бути можливість позначити нотаток, як виконаний, і отримання інформації про те, скільки всього нотаток у списку і скільки залишилося невиконаними. Нотатки не повинні бути порожніми.
Кожний нотаток має назву, зміст, дату створення і редагування та статус. Нотатки бувають двох типів. Дефолтні та такі, які вимагають підтвердження при ридагуванні.
Окремо необхідно розширити поведінку списку та додати можливість пошуку нотатка за ім'ям або змістом.
Також окремо необхідно розширити список можливістю сортування нотаток за статусом або часом створення.
*/

enum TodoStatus {
    Pending = 'pending',
    Completed = 'completed' 
}

enum TodoType {
    Default = 'default',
    Confirmable = 'confirmable' 
}

enum SortField {
    Status = 'status',
    CreatedAt = 'createdAt' 
}

enum SortOrder {
    Asc= 'asc',
    Desc = 'desc' 
}

type SortOptions = {
    field: SortField;
    order: SortOrder;
}   

interface ITodo {
    id: number;
    title: string;
    content: string;
    status: TodoStatus;
    type: TodoType;
    createdAt: Date;
    updatedAt: Date;
}

interface ITodoList {
    add(title: string, content: string, type: TodoType): ITodo;
    delete(id: number): void;
    edit(id: number, title?: string, content?: string, confirmed?: boolean): void;
    getById(id: number): ITodo | undefined;
    getAllTodos(): ITodo[];
    markAsCompleted(id: number): void;
    getTotal(): number;
    getPendingTodosCount(): number;
}

interface Searchable {
    search(query: string): ITodo[];
}

interface Sortable {
    sort(options: SortOptions): ITodo[];
}

class Todo implements ITodo {
    private static idCounter = 0;
    public readonly id: number;
    public title: string;
    public content: string;
    public status: TodoStatus;
    public type: TodoType;
    public createdAt: Date;
    public updatedAt: Date;
    
    constructor(title: string, content: string, type: TodoType = TodoType.Default) {
        if (!title.trim() || !content.trim()) {
            throw new Error('Title and content cannot be empty');
        }
        this.id = Todo.idCounter++;
        this.title = title;
        this.content = content;
        this.type = type;
        this.status = TodoStatus.Pending;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

class TodoList implements ITodoList {
    private todos: ITodo[] = [];
    
    add(title: string, content: string, type: TodoType): ITodo {
        const newTodo = type === TodoType.Confirmable
            ? new ConfirmableTodo(title, content, type)
            : new Todo(title, content, type);
        this.todos.push(newTodo);
        return newTodo;
    }

    delete(id: number): void {
        this.todos = this.todos.filter(todo => todo.id !== id);
    }

    edit(id: number, title?: string, content?: string, confirmed?: boolean): void {
        const todo = this.getById(id);
        if (!todo) return;

        if (todo instanceof ConfirmableTodo && !todo.isTodoConfirmed()) {
            throw new Error('Editing requires confirmation');
        }

        if (title) todo.title = title;
        if (content) todo.content = content;
        todo.updatedAt = new Date();
    }

    getById(id: number): ITodo | undefined {
        return this.todos.find(todo => todo.id === id);
    }

    getAllTodos(): ITodo[] {
        return this.todos;
    }

    markAsCompleted(id: number): void {
        const todo = this.getById(id);
        if (todo) {
            todo.status = TodoStatus.Completed;
            todo.updatedAt = new Date();
        }
    }

    getTotal(): number {
        return this.todos.length;
    }

    getPendingTodosCount(): number {
        return this.todos.filter(todo => todo.status === TodoStatus.Pending).length;
    }
}

class ConfirmableTodo extends Todo {
    private isConfirmed: boolean = false;

    confirm(): void {
        this.isConfirmed = true;
    }

    isTodoConfirmed(): boolean {
        return this.isConfirmed;
    }
}

class SearchableTodoList extends TodoList implements Searchable  {
    search(query: string): ITodo[] {
        return this.getAllTodos().filter(todo => 
            todo.title.includes(query) || 
            todo.content.includes(query)
        ); 
    }
}

class SortableTodoList extends SearchableTodoList implements Sortable {
   sort(options: SortOptions): ITodo[] {
        const sortedTodos = [...this.getAllTodos()];
        sortedTodos.sort((a, b) => {
            if (options.field === SortField.Status) {
                return options.order === SortOrder.Asc 
                    ? a.status.localeCompare(b.status) 
                    : b.status.localeCompare(a.status);
            } else if (options.field === SortField.CreatedAt) {
                return options.order === SortOrder.Asc 
                    ? a.createdAt.getTime() - b.createdAt.getTime() 
                    : b.createdAt.getTime() - a.createdAt.getTime();
            }
            return 0;
        }); 
        return sortedTodos;
   }
}

// --- TEST CASES ---
const todoList = new SortableTodoList();

const todo1 = todoList.add('Buy goods', 'Milk, eggs, bread', TodoType.Default);
const todo2 = todoList.add('Read a book', 'Read chapter 5', TodoType.Default);
const todo3 = todoList.add('Fix bug', 'Fix the login issue in auth module', TodoType.Confirmable);

console.log(' All todos');
console.log(todoList.getAllTodos());

console.log('\n Total / Pending ');
console.log('Total:', todoList.getTotal());
console.log('Pending:', todoList.getPendingTodosCount());

todoList.markAsCompleted(todo1.id);
console.log('\ After markAsCompleted (todo1)');
console.log('Pending:', todoList.getPendingTodosCount());

todoList.edit(todo2.id, 'Read a book (updated)');
console.log('\n After edit todo2');
console.log(todoList.getById(todo2.id));

console.log('\n Edit ConfirmableTodo without confirmation');
try {
    todoList.edit(todo3.id, 'Fix bug (updated)');
} catch (e) {
    console.log('Error:', (e as Error).message);
}

(todo3 as ConfirmableTodo).confirm();
todoList.edit(todo3.id, 'Fix bug (confirmed update)');
console.log('\n After confirmed edit todo3');
console.log(todoList.getById(todo3.id));

console.log('\n Search "book"');
console.log(todoList.search('book'));

console.log('\n Sort by status ASC');
console.log(todoList.sort({ field: SortField.Status, order: SortOrder.Asc }));

console.log('\n Sort by createdAt DESC');
console.log(todoList.sort({ field: SortField.CreatedAt, order: SortOrder.Desc }));

todoList.delete(todo1.id);
console.log('\n After delete todo1');
console.log('Total:', todoList.getTotal());
console.log(todoList.getAllTodos());

console.log('\n Empty todo validation');
try {
    todoList.add('', 'some content', TodoType.Default);
} catch (e) {
    console.log('Error:', (e as Error).message);
}