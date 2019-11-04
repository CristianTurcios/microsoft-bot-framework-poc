module.exports = {
  parseName(name) {
    const names = name.split(' ');
    let firstName; let lastName;
    if (names.length === 2) {
      firstName = names[0];
      lastName = names[2];
    } else if (names.length === 3) {
      firstName = names.slice(0, -1).join(' ');
      lastName = names.slice(-1).join(' ');
    } else if (names.length === 4) {
      firstName = names.slice(0, -2).join(' ');
      lastName = names.slice(-2).join(' ');
    } else {
      firstName = name;
      lastName = name;
    }

    return { firstName, lastName };
  },
};
