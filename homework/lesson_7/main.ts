// 1. У вас є типи Car, Truck та об'єднання Vehicle. Напишіть функцію getVehicleCapacity(vehicle: Vehicle): string,
// яка робить звуження типу за дискримінантом kind та повертає спецефічне повідомлення про навантаження.
// Реалізуйте вичерпну перевірку за допомогою функції. Додайте до об'єднання новий тип Motorcycle, щоб переконатися,
// що ваша функція "впаде" з помилкою на етапі компіляції.

interface Car {
  kind: 'car';
  passengers: number;
}

interface Truck {
  kind: 'truck';
  cargoWeight: number;
}

 interface Motorcycle {
   kind: 'motorcycle';
   passengers: number;
   hasSidecar: boolean;
 }

type VehicleType = Car | Truck ;

const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function getVehicleCapacity(vihicle: VehicleType): string | undefined {
  switch (vihicle.kind) {
    case 'car':
      return `This car can carry ${vihicle.passengers} passengers.`;
    case 'truck':
      return `This truck can carry ${vihicle.cargoWeight} kg of cargo.`;
    default:
      assertNever(vihicle);
  }
}

// interface Motorcycle {
//   kind: 'motorcycle';
//   hasSidecar: boolean;
// }

// 2. Ви отримуєте повідомлення через WebSocket, яке має тип unknown. Реалізуйте функцію-захисник типу isChatMessage,
// яка перевіряє, чи відповідає отриманий об'єкт інтерфейсу ChatMessage. Використовуйте різні оператори
// для безпечної перевірки.

interface ChatMessage {
  text: string;
  authorId: number;
}

function isChatMessage(data: unknown): data is ChatMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const hasText = 
  'text' in data 
  && Object.hasOwn(data, 'text') 
  && typeof data.text === 'string';
  
  const hasAuthorId =
   'authorId' in data 
   && Object.hasOwn(data, 'authorId')
   && typeof data.authorId === 'number';

  return hasText && hasAuthorId;

}

function processMessage(data: unknown): void {
  if (isChatMessage(data)) {
    console.info(`User ${data.authorId} says: "${data.text.toUpperCase()}"`);
  } else {
    console.error('Invalid format');
  }
}

// 3. Тип RouteHandlers вимагає, щоб значенням маршруту була строка (назва компонента) або об'єкт із функцією action.
// Створіть об'єкт appRoutes із маршрутами home (string) та login (об'єкт із методом action).
// Оголосіть його так, щоб компілятор перевірив відповідність типу RouteHandlers, але водночас зберіг точну структуру об'єкта.
// Переконайтеся, що виклик appRoutes.login.action() не викликає помилки.

type RouteHandlers = {
  [routePath: string]: string | { action: () => void };
};

const appRoutes = {
  home: 'index',
  login: {
    action: () => {
      console.log('Login action executed');
    }
  }
} satisfies RouteHandlers;

console.log(appRoutes.login.action())