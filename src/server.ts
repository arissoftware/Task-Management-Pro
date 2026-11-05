import app from "./app.js";
import { ENV } from "./utils/env.js";

app.listen(ENV.PORT, () => {
  console.log(`Server listening on http://localhost:${ENV.PORT}`);
});
