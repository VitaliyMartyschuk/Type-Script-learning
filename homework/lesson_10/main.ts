/*
У вас є дві сутності - список фільмів і список категорій фільмів.

Кожен фільм містить поля: назва, рік випуску, рейтинг, список нагород.

Категорія містить поля: назва і фільми.

У кожного списку є пошук за ім'ям (це, по суті, фільтрація), у списку фільмів є додаткова фільтрація за роком випуску, рейтингом і нагородами.

У нас визначено три типи фільтрів:

Фільтр відповідності має поле filter
Фільтр діапазону має поле filter і filterTo
Фільтр пошуку за значеннями має поле values
Кожен список містить стан його фільтрів, який може бути змінений тільки методом applySearchValue або applyFiltersValue (за наявності додаткових фільтрів)

Вам необхідно подумати про поділ вашого коду на різні сутності, інтерфеси і типи, щоб зробити ваше рішення типобезпечним. Реалізація всіх методів не є необхідною - це за бажанням. 
*/
type GridFilterValue<T> = {
  type: GridFilterTypeEnum;
  filter: Extract<T, string | number>;
  filterTo?: Extract<T, string | number>;
};

type GridFilterSetValues<T> = {
  values: T[];
};

enum GridFilterTypeEnum {
  Match = 'match',
  Range = 'range'
}

interface Film {
  name: string;
  releaseYear: number;
  rating: number;
  awards: string[];
}

type Category = {
  name: string;
  films: Film[];
}

interface FilmFiltersState {
  name?: GridFilterValue<string>;
  releaseYear?: GridFilterValue<number>;
  rating?: GridFilterValue<number>;
  awards?: GridFilterSetValues<string>;
}

interface CategoryFiltersState {
  name?: GridFilterValue<string>;
}

abstract class FilterableList<T, F> {
  protected items: T[];
  protected filtersState: F; 

  constructor(items: T[], filtersState: F) {
    this.items = items;
    this.filtersState = filtersState;
  }

  applySearchValue(value: string): void {
    this.filtersState = {
      ...this.filtersState,
      name: {
        type: GridFilterTypeEnum.Match,
        filter: value
      }
    };
  }

  protected abstract getFilteredItems(): T[];
}

class FilmList extends FilterableList<Film, FilmFiltersState> {
  constructor(films: Film[]) {
    super(films, {});
  }

  applyFiltersValue(filters: Omit<FilmFiltersState, 'name'>): void {
    this.filtersState = {
      ...this.filtersState,
      ...filters
    };
  }
  
  protected getFilteredItems(): Film[] {
    return this.items.filter(movie => {
      // Реалізація фільтрації фільмів на основі this.filtersState
      return true;
    });
  } 
}

class CategoryList extends FilterableList<Category, CategoryFiltersState> {
  constructor(categories: Category[]) {
    super(categories, {});
  }

  getFilteredItems(): Category[] {
    return this.items.filter(category => {
      // Реалізація фільтрації категорій на основі this.filtersState
      return true;
    });
  }
}



