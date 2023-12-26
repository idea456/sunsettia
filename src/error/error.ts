import { TokenType } from "../parser/token";

export const ParseErrorType = {
    UnmatchedTagError: "UnmatchedTagError",
    NoComponentNameError: "NoComponentNameError",
} as const;

export const BaseErrorType = {
    NoConfigFileError: "NoConfigFileError",
    NoEntrySpecifiedError: "NoEntrySpecifiedError",
} as const;

export class ParseError implements Error {
    type: keyof typeof ParseErrorType;
    name: string;
    message: string;
    stack?: string | undefined;
    cause?: unknown;
    token: Token;

    constructor(type: keyof typeof ParseErrorType, token: Token) {
        this.token = token;
        this.name = ParseErrorType[type];
        this.type = type;
        switch (type) {
            case ParseErrorType.UnmatchedTagError:
                this.message = `Unmatched tag <${token.name}${
                    token.type === TokenType.EndTag ? "/>" : ">"
                } at line ${token.line}.`;
                break;
            default:
                this.message = "";
        }
    }
}

export class BaseError implements Error {
    type: keyof typeof BaseErrorType;
    name: string;
    message: string;
    stack?: string | undefined;
    cause?: unknown;

    constructor(type: keyof typeof BaseErrorType) {
        this.name = BaseErrorType[type];
        this.type = type;
        switch (type) {
            case BaseErrorType.NoConfigFileError:
                this.message =
                    "No config file found, please specify a config file within the root of your project folder.";
                break;
            default:
                this.message = "";
        }
    }
}
