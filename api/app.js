const express = require("express");
const admin = require("firebase-admin");

const app = express();
const port = 3000;

admin.initializeApp({});
function getIdToken(req) {
  const authorizationHeader = req.headers.authorization || "";
  const components = authorizationHeader.split(" ");
  return components.length > 1 ? components[1] : "";
}

app.get("/profile", (req, res) => {
  const idToken = getIdToken(req);
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedClaims) => {
      return res.json(decodedClaims);
    })
    .catch((error) => {
      console.log(error);
      res.status(401);
      res.json({ error: "You must be logged in to continue!" });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
