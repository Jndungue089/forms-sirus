import app from "./app.js";

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor da Liga de Cortes a correr em http://localhost:${port}`);
});
