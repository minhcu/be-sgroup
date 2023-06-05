
1. Run `npm install`
2. Run `npm init`
2. Run `npm start`

## /users
- GET /users?(query || q)=?&limit=?&page=?
### /users/add
- POST
```json
    {
        "username": "this field is required",
        "password": "this field is optional",
        "name": "this field is optional",
        "age": "this field is optional",
        "gender": "this field is optional"
    }
```
### /users/:id
- GET
- DELETE
- PUT
```json
    {
        "name": "this field is required",
        "age": "this field is required",
        "gender": "this field is required"
    }
```

## How to get admin token

Use this token
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzc21pbiIsIm5hbWUiOiJhc3NtaW4iLCJlbWFpbCI6bnVsbCwiYWdlIjpudWxsLCJnZW5kZXIiOm51bGwsImlhdCI6MTY4NTgxNDIyMywiZXhwIjoxNjg4NDA2MjIzLCJpc3MiOiJsb2NhbGhvc3QifQ.6G-_zDX-Z2Dad3QadPr62TJOg-GoL5GBZwd20MDyhlY"
}
```

or POST `auth/login` with this
```json
{
    "username": "assmin",
    "password": "assmin"
}
```