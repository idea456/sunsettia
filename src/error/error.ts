import { Token } from "../types/token";

export const ParseErrorType = {
    UnmatchedTagError: "UnmatchedTagError",
    NoComponentNameError: "NoComponentNameError",
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
                this.message = `Unmatched tag ${token.literal} at line ${token.line}.`;
            default:
                this.message = "";
        }
    }
}
