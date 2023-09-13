const validationChecker = (flashes, path) => {
  if (!flashes.errorObject) {
    return false;
  }
  const message = flashes.errorObject.find((err) => err.path === path);
  console.log(message);
  if (!message) {
    return false;
  }
  return message.msg;
};

module.exports = {
  validationChecker,
};
