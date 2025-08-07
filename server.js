const app = require('./app');
// LISTENER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `App is Listening on: ${PORT}`
  );
});
