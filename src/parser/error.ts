export enum ErrorState {}

export class ParseError implements Error {
    name: string;
    message: string;
    stack?: string | undefined;
}
