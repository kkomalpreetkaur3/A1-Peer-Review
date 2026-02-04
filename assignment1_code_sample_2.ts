import * as readline from "readline";
import * as mysql from "mysql";
import * as https from "https";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "app_user",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mydb",
};

function isValidName(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= 50 &&
    /^[a-zA-Z\s'-]+$/.test(trimmed)
  );
}

function getUserInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter your name: ", (answer) => {
      rl.close();

      const cleaned = answer.trim();

      if (!isValidName(cleaned)) {
        resolve("Guest");
        return;
      }

      resolve(cleaned);
    });
  });
}

function sendEmail(to: string, subject: string, body: string) {
  console.log(`Email queued to ${to} with subject "${subject}".`);
}

function getData(): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get("https://insecure-api.com/get-data", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", () => reject(new Error("Request failed.")));
  });
}

function saveToDb(data: string) {
  const connection = mysql.createConnection(dbConfig);

  const query = "INSERT INTO mytable (column1, column2) VALUES (?, ?)";
  const values = [data, "Another Value"];

  connection.connect();

  connection.query(query, values, (error) => {
    if (error) {
      console.error("Database operation failed.");
    } else {
      console.log("Data saved");
    }
    connection.end();
  });
}

(async () => {
  const userInput = await getUserInput();
  const data = await getData();
  saveToDb(data);
  sendEmail("admin@example.com", "User Input", userInput);
})();
