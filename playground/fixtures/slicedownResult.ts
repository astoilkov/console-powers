const slicedownResult = [
    {
        level: 1,
        content: "header",
        nodes: [
            {
                type: "block-header__marker",
                start: 0,
                end: 2,
            },
            {
                type: "block-header__text",
                start: 2,
                end: 8,
                container: "inline",
                nodes: [],
            },
        ],
        type: "block-header",
        start: 0,
        end: 8,
        interrupted: true,
    },
    {
        type: "block-blank",
        start: 9,
        end: 9,
    },
    {
        nodes: [
            {
                type: "block-quote__marker",
                start: 10,
                end: 12,
                nodes: [
                    {
                        type: "block-quote__marker-text",
                        start: 10,
                        end: 11,
                    },
                ],
            },
            {
                type: "block-quote__text",
                start: 12,
                end: 36,
                container: "block",
                nodes: [
                    {
                        nodes: [
                            {
                                type: "block-paragraph__text",
                                start: 12,
                                end: 36,
                                container: "inline",
                                nodes: [],
                            },
                        ],
                        type: "block-paragraph",
                        start: 12,
                        end: 36,
                    },
                ],
            },
        ],
        type: "block-quote",
        start: 10,
        end: 36,
        interrupted: true,
    },
    {
        type: "block-blank",
        start: 37,
        end: 37,
    },
    {
        indent: 0,
        marker: "-",
        nodes: [
            {
                type: "block-uli__marker",
                start: 38,
                end: 40,
                nodes: [
                    {
                        type: "block-uli__marker-text",
                        start: 38,
                        end: 39,
                    },
                ],
            },
            {
                type: "block-uli__text",
                start: 40,
                end: 51,
                baseline: 2,
                container: "block",
                nodes: [
                    {
                        nodes: [
                            {
                                type: "block-paragraph__text",
                                start: 40,
                                end: 51,
                                container: "inline",
                                nodes: [],
                            },
                        ],
                        type: "block-paragraph",
                        start: 40,
                        end: 51,
                    },
                ],
            },
        ],
        type: "block-uli",
        start: 38,
        end: 51,
    },
    {
        indent: 0,
        marker: "-",
        nodes: [
            {
                type: "block-uli__marker",
                start: 52,
                end: 54,
                nodes: [
                    {
                        type: "block-uli__marker-text",
                        start: 52,
                        end: 53,
                    },
                ],
            },
            {
                type: "block-uli__text",
                start: 54,
                end: 65,
                baseline: 2,
                container: "block",
                nodes: [
                    {
                        nodes: [
                            {
                                type: "block-paragraph__text",
                                start: 54,
                                end: 65,
                                container: "inline",
                                nodes: [],
                            },
                        ],
                        type: "block-paragraph",
                        start: 54,
                        end: 65,
                    },
                ],
            },
        ],
        type: "block-uli",
        start: 52,
        end: 65,
    },
];

export default slicedownResult;
