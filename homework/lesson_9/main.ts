Вам потрібно створити тип DeepReadonly який буде робити доступними тільки для читання навіть властивості вкладених обʼєктів.

type DeepReadonly<T> = {
    readonly[P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
}

Вам потрібно створити тип DeepRequireReadonly який буде робити доступними тільки для читання навіть властивості вкладених обʼєктів та ще й робити їх обовʼязковими.

type DeepRequireReadonly<T> = {
    readonly [P in keyof T]-?: T[P] extends object ? DeepRequireReadonly<T[P]> : T[P];
}

Вам потрібно створити тип UpperCaseKeys, який буде приводити всі ключі до верхнього регістру.

type UpperCaseKeys<T> = {
    [P in keyof T as Uppercase<P & string>]: T[P];
}

Cтворіть тип ObjectToPropertyDescriptor, який перетворює звичайний обʼєкт на обʼєкт де кожне value є дескриптором.

type ObjectToPropertyDescriptor<T> = {
    [P in keyof T]: {
        value: T[P];
        writable: boolean;
        enumerable: boolean;
        configurable: boolean;
        get(): T[P];
        set(value: T[P]): void;
    }
}