const corsOptions = {
  origin: (origin, callback) => {
    return callback(null, true);
  },
};

module.exports = corsOptions;
