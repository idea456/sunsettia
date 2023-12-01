import { expect, test } from "vitest";
import { Tokenizer } from "../parser";
import { StartTagToken, TokenType } from "../parser/token";

const text = `
    <component name="Header" lazy={is_mobile} server>
        <div client class="container" title={is_mobile ? "Mobile" : "Desktop"}>
            <MyComponent />
            <h1>Hewwo {last_name}</h1>
        </div>
    </component>
    `;

test("Initialize tokenizer", () => {
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    expect(tokenizer.tokens.length).toBeGreaterThan(0);
});

test("Test start and end tag", () => {
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    expect(tokenizer.tokens[0].type).toBe(TokenType.StartTag);
    expect(tokenizer.tokens[0].name).toBe("component");
    // Check for 2nd last element since last element is appended with EOF
    expect(tokenizer.tokens[tokenizer.tokens.length - 2].type).toBe(
        TokenType.EndTag,
    );
    expect(tokenizer.tokens[tokenizer.tokens.length - 2].name).toBe(
        "component",
    );

    expect(tokenizer.tokens[1].type).toBe(TokenType.StartTag);
    expect(tokenizer.tokens[1].name).toBe("div");
    expect(tokenizer.tokens[tokenizer.tokens.length - 3].type).toBe(
        TokenType.EndTag,
    );
    expect(tokenizer.tokens[tokenizer.tokens.length - 3].name).toBe("div");
});

test("Self closing tags", () => {
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    console.log(tokenizer.tokens[2]);
    expect(tokenizer.tokens[2].type).toBe(TokenType.StartTag);
    expect(tokenizer.tokens[2].name).toBe("MyComponent");
    expect(tokenizer.tokens[2].self_closing).toBe(true);
});

test("Literal attributes", () => {
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    const componentAttributes = (tokenizer.tokens[0] as StartTagToken)
        .attributes;
    expect(componentAttributes.length).toBeGreaterThan(0);
    expect(componentAttributes[0].name).toBe("name");
    expect(componentAttributes[0].value).not.toBeUndefined();
    expect(componentAttributes[0].value).toBe("Header");

    const divAttributes = (tokenizer.tokens[1] as StartTagToken).attributes;
    expect(divAttributes.length).toBeGreaterThan(0);
    expect(divAttributes[1].name).toBe("class");
    expect(divAttributes[1].value).not.toBeUndefined();
    expect(divAttributes[1].value).toBe("container");
});

test("Expression attributes", () => {
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    const componentAttributes = (tokenizer.tokens[0] as StartTagToken)
        .attributes;

    expect(componentAttributes[1].name).toBe("lazy");
    expect(componentAttributes[1].value).toBe("is_mobile");
    expect(componentAttributes[1].is_expression).toBe(true);

    const divAttributes = (tokenizer.tokens[1] as StartTagToken).attributes;

    expect(divAttributes[2].name).toBe("title");
    expect(divAttributes[2].value).toBe('is_mobile ? "Mobile" : "Desktop"');
    expect(divAttributes[2].is_expression).toBe(true);
});

test("Self closing attributes", () => {
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    const componentAttributes = (tokenizer.tokens[0] as StartTagToken)
        .attributes;

    expect(componentAttributes[2].name).toBe("server");
    expect(componentAttributes[2].value).toBe("");
    expect(componentAttributes[2].is_self_closing).toBe(true);

    const divAttributes = (tokenizer.tokens[1] as StartTagToken).attributes;
    console.log(divAttributes);
    expect(divAttributes[0].name).toBe("client");
    expect(divAttributes[0].value).toBe("");
    expect(divAttributes[0].is_self_closing).toBe(true);
});
