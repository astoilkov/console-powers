const consoleStyles = {
    light: {
        // data types
        undefined: { color: "#AAAAAA" },
        null: { color: "#AAAAAA" },
        boolean: { color: "#0842A0" },
        number: { color: "#0842A0" },
        bigint: { color: "#136C2E" },
        string: { color: "#DC362E" },

        // extra
        dimmed: { color: "#5F6367" }, // ex: key in object
        highlight: { color: "#881180", fontWeight: "bold" }, // ex: index in array
    },

    dark: {
        // data types
        undefined: { color: "#6F6F6F" },
        null: { color: "#6F6F6F" },
        boolean: { color: "#997FFF" },
        number: { color: "#997FFF" },
        bigint: { color: "#ABABAB" },
        string: { color: "#5CD5FB" },

        // extra
        dimmed: { color: "#8F8F8F" }, // ex: key in object
        highlight: { color: "#7CACF8", fontWeight: "bold" }, // ex: index in array
    },
};

export default consoleStyles;
