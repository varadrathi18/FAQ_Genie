const fetchOptions = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  method: 'POST',
  body: JSON.stringify({ name: "A", email: "B", password: "C" })
};
console.log("fetchOptions", fetchOptions);
