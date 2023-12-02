export enum ErrorType {
    None,
}

export class ParseError implements Error {
    name: string;
    message: string;
    type: ErrorType;
    stack?: string | undefined;

    constructor(type: ErrorType) {
        this.type = type;
        this.name = "test";
        switch (type) {
            case ErrorType.None:
                this.message = "none";
                defult: this.message = "";
        }
    }
}
