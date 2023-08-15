const createId = () => {
    const date = new Date();
    const components = [
        date.getYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    ];

    const id = "id" + components.join("");
    return id;
};

module.exports = createId;
