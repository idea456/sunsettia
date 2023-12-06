import { expect, test } from "vitest";
import { Parser, Tokenizer } from "../parser";
import { StartTagToken, TokenType } from "../parser/token";

const text = `
    <component name="Header" lazy={is_mobile} server>
        Hewwo world
        <div client class="container" title={is_mobile ? "Mobile" : "Desktop"}>
            <MyComponent />
            <h1>Hewwo {last_name}</h1>
        </div>
    </component>
    `;

const basic = `
    <component>
        <div>
            <h1>Hello World</h1>
        </div>
    </component>
`;

const expressionText = `
    <component name="Header">
        <div>
            {name}
        </div>
    </component>
`;

test("Initialize parser", () => {
    const parser = new Parser(text);
    parser.parse();
    expect(parser.ast).not.toBeUndefined();
});

test("Test basic component tree", () => {
    const parser = new Parser(basic);
    parser.parse();
    console.log(parser.ast);
    expect(parser.ast).toStrictEqual({
        code: "",
        component: {
            name: "component",
            attributes: [],
            type: "Tag",
            children: [
                {
                    name: "div",
                    type: "Tag",
                    attributes: [],
                    children: [
                        {
                            name: "h1",
                            type: "Tag",
                            attributes: [],
                            children: [
                                {
                                    type: "Text",
                                    value: "Hello World",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    });
});

// test("Test expression as text", () => {
//     const parser = new Parser(expressionText);
//     parser.parse();
//     console.log("ast", parser.ast);
//     expect(true).toBe(true);
//     // expect(parser.ast).toStrictEqual({
//     //     code: "",
//     //     component: {
//     //         name: "component",
//     //         attributes: [],
//     //         type: "Tag",
//     //         children: [
//     //             {
//     //                 name: "div",
//     //                 type: "Tag",
//     //                 attributes: [],
//     //                 children: [
//     //                     {
//     //                         name: "h1",
//     //                         type: "Tag",
//     //                         attributes: [],
//     //                         children: [
//     //                             {
//     //                                 type: "Text",
//     //                                 value: "Hello World",
//     //                             },
//     //                         ],
//     //                     },
//     //                 ],
//     //             },
//     //         ],
//     //     },
//     // });
// });
