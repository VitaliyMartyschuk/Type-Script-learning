type ShapeColor = string | string[]; // string[] in case of RGB or hsla color

abstract class Shape {
    public readonly name: string;
    public readonly color: ShapeColor;
    public constructor(name: string, color: ShapeColor) {
        this.name = name;
        this.color = color;
    }
    abstract calculateArea(param1: number, param2?: number): number;
    print?(): void;
}

class Circle extends Shape{
    constructor(name: string, color: ShapeColor) {
        super(name, color);
    }

    calculateArea(radius: number): number {
        return Math.PI * radius ** 2;
    }
}

class Rectangle extends Shape {
    constructor(name: string, color: ShapeColor) {
        super(name, color);
    }

    calculateArea(a: number, b: number): number {
        return a * b;
    }

    print(): void {
        console.log(`Square = side a - ${a} multiplied by side b - ${b}`);
    }
}

class Square extends Shape {
    constructor(name: string, color: ShapeColor) {
        super(name, color);
    }

    calculateArea(a: number): number {
        return a ** 2;
    }

    print(): void {
        console.log(`Square = side a - ${a} multiplied by side a - ${a}`);
    }
}

class Triangle extends Shape {
    constructor(name: string, color: ShapeColor) {
        super(name, color);
    }

    calculateArea(sideA: number, height: number): number {
        return (sideA * height) / 2;
    }
}

new Circle('Circle', 'red').calculateArea(5);
new Rectangle('Rectangle', 'blue').calculateArea(4, 6);
new Square('Square', 'green').calculateArea(4);
new Triangle('Triangle', 'yellow').calculateArea(5, 3);