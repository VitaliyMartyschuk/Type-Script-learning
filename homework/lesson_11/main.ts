/* Вам треба створити додаток для управління нотатками, використовуючи принципи ООП, патерн DTO та декоратори.

1. Нотатки
Кожна нотатка має містити:
- ідентифікатор
- назву
- зміст
- дату створення
- дату редагування
- статус
- тип

Нотатки бувають двох типів (використовуйте наслідування):
- Дефолтні.
- Такі, що вимагають підтвердження при редагуванні та видалинні

2. У списку нотаток повинні бути методи для:
- Додавання нового запису.
- Видалення запису за ідентифікатором.
- Редагування запису.
- Отримання повної інформації про нотатку за ідентифікатором.
- Позначення нотатки як "виконаної".
- Отримання статистики: скільки всього нотаток у списку і скільки залишилося невиконаними.
- У списку повинна бути можливість пошуку нотатки за ім'ям або змістом.
- Додайте можливість сортування нотаток за статусом виконання або за часом створення.

3. Робота з даними
Уявіть, що дані надходять до вашого списку із зовнішнього API. Всі вхідні дані приходять у форматі snake_case.
Внутрішня бізнес-логіка вашого додатку та класи повинні суворо використовувати camelCase.

Типізуйте механізм, який автоматично трансформує ключі об'єктів зі snake_case у camelCase при отриманні даних, та навпаки — при поверненні результату клієнту.

4. Декоратори
Для оптимізації та чистоти коду необхідно реалізувати та застосувати наступні декоратори:

@SanitizeInput: Застосовується до методів додавання та редагування. Повинен автоматично видаляти зайві пробіли на початку
та в кінці строк у назві та змісті нотатки перед тим, як дані потраплять до основної логіки методу.

@ValidateNotEmpty: Застосовується після очищення. Нотатки не повинні бути порожніми. Декоратор перевіряє,
чи не є назва та зміст порожніми строками, і якщо так — викидає помилку до виконання основної логіки методу.

@AutoUpdateTimestamp: Застосовується до методу редагування. Декоратор повинен перехоплювати виклик методу
і автоматично оновлювати поле дата редагування поточною датою та часом, звільняючи розробника від необхідності
писати цю логіку всередині самого методу.
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
    add(data: TodoDTO): ITodo;  
    delete(id: number): void;
    edit(id: number, data: Partial<TodoDTO>): void; 
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

type StartsWithUppercase<StringPart extends string> =
  StringPart extends Uncapitalize<StringPart> ? false : true;

type CamelToSnake<Text extends string> =
  Text extends `${infer CurrentChar}${infer RestOfString}`
    ? StartsWithUppercase<RestOfString> extends true
      ? `${Uncapitalize<CurrentChar>}_${CamelToSnake<RestOfString>}`
      : `${Uncapitalize<CurrentChar>}${CamelToSnake<RestOfString>}`
    : Text;

type MapToSnakeCaseDTO<T> = {
  [K in keyof T as CamelToSnake<K & string>]: T[K];
};

type SnakeToCamel<T extends string> =
  T extends `${infer Head}_${infer FirstLetter}${infer Rest}`
    ? `${Head}${Uppercase<FirstLetter>}${SnakeToCamel<Rest>}`
    : T;

type MapToCamelCaseDomain<T> = {
  [K in keyof T as SnakeToCamel<K & string>]: T[K];
};

type TodoDTO = MapToSnakeCaseDTO<ITodo>;

type ReconstructedTodo = MapToCamelCaseDomain<TodoDTO>;

class TodoMapper {
  static fromDTO(data: TodoDTO): ITodo {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      status: data.status,
      type: data.type,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static toDTO(todo: ITodo): TodoDTO {
    return {
      id: todo.id,
      title: todo.title,
      content: todo.content,
      status: todo.status,
      type: todo.type,
      created_at: todo.createdAt,
      updated_at: todo.updatedAt,
    };
  }
}

type Method <T, A extends any[], R> = (this: T, ...args: A) => R;

function SanitizeInput<This, Args extends any[], Return>(
    originalMethod: Method<This, Args, Return>,
    context: ClassMethodDecoratorContext<This, Method<This, Args, Return>>
): Method<This, Args, Return> {
    if (context.kind !== 'method') {
        throw new Error('SanitizeInput can only be applied to methods');
    }

    const methodName = context.name;
    if (methodName !== 'add' && methodName !== 'edit') {
        throw new Error('SanitizeInput can only be applied to add and edit methods');
    }

    return function (this: This, ...args: Args): Return {
        const sanitized = args.map(arg => {
            if (arg && typeof arg === 'object') {
                const dto = arg as Record<string, unknown>;
                return {
                    ...dto,
                    ...(typeof dto.title === 'string' && { title: dto.title.trim() }),
                    ...(typeof dto.content === 'string' && { content: dto.content.trim() }),
                };
            }
            return arg;
        });
        return originalMethod.apply(this, sanitized as unknown as Args);
    };
}

function ValidateNotEmpty<This, Args extends any[], Return>(
    originalMethod: Method<This, Args, Return>,
    context: ClassMethodDecoratorContext<This, Method<This, Args, Return>>
): Method<This, Args, Return> {
    if (context.kind !== 'method') {
        throw new Error('SanitizeInput can only be applied to methods');
    }

    const methodName = context.name;

    if (methodName !== 'add' && methodName !== 'edit') {
        throw new Error('SanitizeInput can only be applied to add and edit methods');
    }

    return function (this: This, ...args: Args): Return {
        for (const arg of args) {
            if (arg && typeof arg === 'object') {
                const dto = arg as Record<string, unknown>;
                if (typeof dto.title === 'string' && dto.title.trim() === '') {
                    throw new Error('Title cannot be empty');
                }
                if (typeof dto.content === 'string' && dto.content.trim() === '') {
                    throw new Error('Content cannot be empty');
                }
            }
        }
        return originalMethod.apply(this, args);
    };
}

function AutoUpdateTimestamp<This, Args extends any[], Return>(
    originalMethod: Method<This, Args, Return>,
    context: ClassMethodDecoratorContext<This, Method<This, Args, Return>>
): Method<This, Args, Return> {
    if (context.kind !== 'method') {
        throw new Error('SanitizeInput can only be applied to methods');
    }

    const methodName = context.name;

    if (methodName !== 'edit') {
        throw new Error('AutoUpdateTimestamp can only be applied to edit method');
    }

    return function (this: This, ...args: Args): Return {
        const result = originalMethod.apply(this, args);
        const id = args[0] as unknown as number;
        const todo = (this as any).getById(id) as ITodo;
        if (todo) {
            todo.updatedAt = new Date();
        }
        return result;
    };
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
    
    addFromDTO(data: TodoDTO): ITodo {
        return this.add(data);
    }

    getAllAsDTO(): TodoDTO[] {
        return this.todos.map(todo => TodoMapper.toDTO(todo));
    }

    getByIdAsDTO(id: number): TodoDTO | undefined {
        const todo = this.getById(id);
        return todo ? TodoMapper.toDTO(todo) : undefined;
    }

    @SanitizeInput
    @ValidateNotEmpty
    add(data: TodoDTO): ITodo {
        const mapped = TodoMapper.fromDTO(data);
        const newTodo = mapped.type === TodoType.Confirmable
            ? new ConfirmableTodo(mapped.title, mapped.content, mapped.type)
            : new Todo(mapped.title, mapped.content, mapped.type);
        this.todos.push(newTodo);
        return newTodo;
    }


    delete(id: number): void {
        this.todos = this.todos.filter(todo => todo.id !== id);
    }

    @SanitizeInput
    @ValidateNotEmpty
    @AutoUpdateTimestamp
    edit(id: number, data: Partial<TodoDTO>): void {
        const todo = this.getById(id);
        if (!todo) return;

        if (todo instanceof ConfirmableTodo && !todo.isTodoConfirmed()) {
            throw new Error('Editing requires confirmation');
        }

        if (data.title) todo.title = data.title;
        if (data.content) todo.content = data.content;
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

const mockServerResponse: TodoDTO[] = [
  {
    id: 1,
    title: 'Прочитати: Великий Гетсбі (Ф. Скотт Фіцджеральд)',
    content: 'Проаналізувати мотив «зеленого вогника» та крах американської мрії.',
    status: TodoStatus.Completed,
    type: TodoType.Default,
    created_at: new Date('2026-02-01T10:00:00Z'),
    updated_at: new Date('2026-02-02T15:30:00Z'),
  },
  {
    id: 2,
    title: 'Купити: На Західному фронті без змін (Е.М. Ремарк)',
    content: 'Звернути увагу на контраст між мирним життям та жахами окопів.',
    status: TodoStatus.Pending,
    type: TodoType.Confirmable,
    created_at: new Date('2026-02-05T09:15:00Z'),
    updated_at: new Date('2026-02-05T09:15:00Z'),
  },
  {
    id: 3,
    title: 'Написати есе: Фієста (Е. Хемінґвей)',
    content: 'Розібрати «принцип айсберга» Хемінґвея.',
    status: TodoStatus.Pending,
    type: TodoType.Default,
    created_at: new Date('2026-02-10T14:20:00Z'),
    updated_at: new Date('2026-02-12T11:00:00Z'),
  },
];

// ============================================================
// TEST CASES
// ============================================================

const todoList = new SortableTodoList();

// --- Завантаження з API через add(TodoDTO) ---
console.log('=== Завантаження нотаток з API ===');
const loaded = mockServerResponse.map(dto => todoList.add(dto));
console.log('Завантажено:', todoList.getTotal(), 'нотаток');

// --- Статистика ---
console.log('\n=== Статистика ===');
console.log('Всього:', todoList.getTotal());
console.log('Невиконаних:', todoList.getPendingTodosCount());

// --- getAllAsDTO — повернути клієнту у snake_case ---
console.log('\n=== Всі нотатки у форматі DTO (snake_case) ===');
console.log(todoList.getAllAsDTO());

// --- getByIdAsDTO ---
console.log('\n=== Отримати нотатку за id у форматі DTO ===');
console.log(todoList.getByIdAsDTO(loaded[0].id));

// --- markAsCompleted ---
console.log('\n=== Позначити як виконану (Хемінґвей) ===');
todoList.markAsCompleted(loaded[2].id);
console.log('Невиконаних після позначення:', todoList.getPendingTodosCount());

// --- Редагування звичайної нотатки через Partial<TodoDTO> ---
console.log('\n=== Редагування нотатки (Хемінґвей) ===');
todoList.edit(loaded[2].id, { title: 'Написати есе: Фієста (оновлено)' });
console.log(todoList.getById(loaded[2].id));

// --- Редагування ConfirmableTodo без підтвердження ---
console.log('\n=== Редагування ConfirmableTodo без підтвердження ===');
try {
    todoList.edit(loaded[1].id, { title: 'Оновлена назва' });
} catch (e) {
    console.log('Помилка:', (e as Error).message);
}

// --- Редагування ConfirmableTodo з підтвердженням ---
console.log('\n=== Редагування ConfirmableTodo з підтвердженням ===');
(loaded[1] as ConfirmableTodo).confirm();
todoList.edit(loaded[1].id, { title: 'Купити: На Західному фронті (підтверджено)' });
console.log(todoList.getById(loaded[1].id));

// --- @SanitizeInput — пробіли обрізаються ---
console.log('\n=== @SanitizeInput — trim пробілів ===');
const trimmed = todoList.add({
    id: 4,
    title: '   Нова нотатка   ',
    content: '   Зміст нотатки   ',
    status: TodoStatus.Pending,
    type: TodoType.Default,
    created_at: new Date(),
    updated_at: new Date(),
});
console.log('title:', `"${trimmed.title}"`);
console.log('content:', `"${trimmed.content}"`);

// --- @ValidateNotEmpty — порожня назва ---
console.log('\n=== @ValidateNotEmpty — порожня назва ===');
try {
    todoList.add({
        id: 5,
        title: '   ',
        content: 'Якийсь зміст',
        status: TodoStatus.Pending,
        type: TodoType.Default,
        created_at: new Date(),
        updated_at: new Date(),
    });
} catch (e) {
    console.log('Помилка:', (e as Error).message);
}

// --- Пошук ---
console.log('\n=== Пошук "фронт" ===');
console.log(todoList.search('фронт'));

console.log('\n=== Пошук "айсберг" (по змісту) ===');
console.log(todoList.search('айсберг'));

// --- Сортування за статусом ---
console.log('\n=== Сортування за статусом ASC ===');
console.log(todoList.sort({ field: SortField.Status, order: SortOrder.Asc }));

// --- Сортування за датою створення ---
console.log('\n=== Сортування за датою створення DESC ===');
console.log(todoList.sort({ field: SortField.CreatedAt, order: SortOrder.Desc }));

// --- Видалення ---
console.log('\n=== Видалення нотатки (Гетсбі) ===');
todoList.delete(loaded[0].id);
console.log('Всього після видалення:', todoList.getTotal());
console.log(todoList.getAllTodos());