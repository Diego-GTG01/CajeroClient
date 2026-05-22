export interface Result<T> {
    correct: boolean;
    message: string;
    object: T;
    objects: T[];
    ex: Error;

}
