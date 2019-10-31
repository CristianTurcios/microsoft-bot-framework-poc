module.exports = {
    parseName(name) {
        let names = name.split(' ');
        let first_name, last_name;
        if (names.length === 2) {
            first_name = names[0];
            last_name = names[2];
        } else if (names.length === 3) {
            first_name = names.slice(0, -1).join(' ');
            last_name = names.slice(-1).join(' ');
        } else if (names.length === 4) {
            first_name = names.slice(0, -2).join(' ');
            last_name = names.slice(-2).join(' ');
        } else {
            first_name = name;
            last_name = name;
        }

        return { first_name, last_name };
    }
}